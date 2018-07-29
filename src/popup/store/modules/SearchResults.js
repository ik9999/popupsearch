import _ from 'lodash';
import googleHTML from '../../search/googleHTML.js';
import Vue from 'vue';
import querystring from 'querystring-browser';
import db from '../../helper/Database.js';

const state = {
  searches: {},
  curSearchVisitedLinks: {},
  isLoadingResults: false,
  isShowingResults: false,
  isEnd: false,
  isError: false,
  errorMsg: undefined,
  errorPageUrl: undefined,
  areResultsFromCache: false,
  currentResultDbObj: {
    id: undefined,
    scrollPos: undefined
  }
};

const getters = {
  getCurrentSearchResults(state, getters, rootState) {
    const searchEngine = rootState.settings.settings.searchEngine;
    const currentKeyword = rootState.keywords.currentKeyword;
    if (
      _.isUndefined(currentKeyword) || _.isUndefined(state.searches[searchEngine]) ||
      _.isUndefined(state.searches[searchEngine][currentKeyword.name])
    ) {
      return [];
    }
    return state.searches[searchEngine][currentKeyword.name];
  }
};

const mutations = {
  appendSearchResults(state, {searchEngine, keyword, links, forceNew, start}) {
    if (_.isUndefined(state.searches[searchEngine])) {
      Vue.set(state.searches, searchEngine, {});
    }
    if (_.isUndefined(state.searches[searchEngine][keyword]) || forceNew || start === 0) {
      Vue.set(state.searches[searchEngine], keyword, []);
    }
    if (_.size(links) < 3) {
      state.isEnd = true;
    }
    state.searches[searchEngine][keyword] = _.concat(
      state.searches[searchEngine][keyword], links
    );
    state.isShowingResults = true;
  },
  setIsLoading(state, value) {
    state.isLoadingResults = value;
    state.isShowingResults = !value;
  },
  setError(state, {val, msg, url}) {
    state.isError = val;
    state.errorMsg = msg;
    state.errorPageUrl = url;
  },
  setAreResultsFromCache(state, val) {
    state.areResultsFromCache = Boolean(val);
  },
  setResCacheData(state, {id, scrollPos}) {
    state.currentResultDbObj.id = id;
    state.currentResultDbObj.scrollPos = scrollPos;
  },
  setCurSearchVisitedLinks(state, visitedlinksObj) {
    state.curSearchVisitedLinks = visitedlinksObj;
  }
};

const actions = {
  load() {
    return new Promise(resolveFn => {
      resolveFn();
    });
  },
  async search({rootState, commit, dispatch, getters}, params) {
    if (!params.keyword) {
      if (rootState.keywords.currentKeyword) {
        params.keyword = rootState.keywords.currentKeyword.name;
      }
      params.start = getters.getCurrentSearchResults.length + 1;
    }
    params = _.extend({
      start: 0,
      forceNew: false,
      forceUpdateDbTime: false
    }, params);
    let searchEngine = rootState.settings.settings.searchEngine;
    let {keyword, start, forceNew, forceUpdateDbTime} = params;
    if (!_.isString(keyword) || _.isEmpty(keyword)) {
      return Promise.resolve([]);
    }
    commit('setIsLoading', true);
    await dispatch('keywords/updateCurrentKeyword', {
      keyword,
      forceNew: forceNew || forceUpdateDbTime
    }, {root:true});
    if (rootState.keywords.isDdgSpecialKeyword) {
      let keywordEscaped = querystring.escape(keyword);
      let url = `https://duckduckgo.com/?q=${keywordEscaped}`;
      return dispatch('links/openLink', {
        url, 
        keyModifier: params.keyModifier,
      }, {root:true});
    }
    let isResInDb = undefined;
    if (!forceNew && start === 0) {
      let foundDbRes = await db.results.where({
        keyword,
        search_engine: searchEngine,
      }).limit(1).first();
      isResInDb = Boolean(foundDbRes);
      if (foundDbRes) {
        let links = JSON.parse(foundDbRes.results_json_str);
        commit('appendSearchResults', {searchEngine, keyword, links, forceNew, start});
        commit('setAreResultsFromCache', true);
        commit('setResCacheData', {
          id: foundDbRes.id,
          scrollPos: foundDbRes.last_scrolling_position
        });
        dispatch('updateVisitedLinks', {forceNew: true});
        commit('ui/setFocusedElement', 'searchresults', {root:true});
        dispatch('ui/setScrollPos', {pos: foundDbRes.last_scrolling_position}, {root:true});
      }
    }
    commit('setAreResultsFromCache', Boolean(isResInDb));

    if (!isResInDb) {
      switch (searchEngine) {
      case 'googleHTML':
        let links = [];
        try {
          let result = await googleHTML(keyword, start);
          if (_.size(_.get(result, 'links')) > 0) {
            links = _.get(result, 'links');
          }
          commit('setError', {
            val: false
          });
        } catch(err) {
          commit('setError', {
            val: true,
            msg: err.message,
            url: err.url
          });
          setTimeout(() => {
            commit('setError', {
              val: false
            });
          }, 5000);
        }
        commit('appendSearchResults', {searchEngine, keyword, links, forceNew, start});
        break;
      }
    }

    dispatch('keywords/updateSearchedMoreKeywords', {
      resultUrlList: _.map(getters.getCurrentSearchResults, ({href, subLinkList}) => {
        if (_.size(subLinkList) > 0) {
          return href;
        }
      })
    }, {root:true});
    commit('setIsLoading', false);
    dispatch('updateVisitedLinks', {forceNew: (start === 0 ? true : false)});

    if (!isResInDb) {
      let foundDbRes;
      let resDbId;
      if (_.isUndefined(isResInDb)) {
        foundDbRes = await db.results.where({
          keyword,
          search_engine: searchEngine,
        }).limit(1).first();
        resDbId = foundDbRes.id;
      }
      let resultsJsonStr = JSON.stringify(getters.getCurrentSearchResults);
      if (isResInDb === false || !foundDbRes) {
        resDbId = await db.results.add({
          keyword,
          search_engine: searchEngine,
          results_json_str: resultsJsonStr,
          last_scrolling_position: 0
        });
      } else {
        await db.results.where({id: resDbId}).modify({results_json_str: resultsJsonStr});
      }
      commit('setResCacheData', {id: resDbId});
    }
  },
  async updateDbScrollPos({state}, {pos}) {
    if (!state.currentResultDbObj.id || state.currentResultDbObj.scrollPos === pos) {
      return ;
    }
    await db.results.where({id: state.currentResultDbObj.id}).modify({
      last_scrolling_position: pos
    });
  },
  async updateVisitedLinks({state, getters, commit, rootState}, {forceNew}) {
    if (forceNew) {
      commit('setCurSearchVisitedLinks', {});
    }
    let linkObjPairs = await Promise.all(_(getters.getCurrentSearchResults).transform((linkList, resultData) => {
      if (!resultData) {
        return ;
      }
      if (resultData.href) {
        linkList.push(resultData.href);
      }
      _.each(resultData.subLinkList, ({href}) => linkList.push(href));
    }, []).map(async(link) => {
      let linkObj = state.curSearchVisitedLinks[link];
      if (_.isUndefined(linkObj)) {
        linkObj = await db.visitedlinks.where({
          link,
          search_keyword: rootState.keywords.currentKeyword.name
        }).limit(1).first();
        if (!linkObj) {
          linkObj = await db.visitedlinks.where({
            link,
          }).limit(1).first();
        }
        if (!linkObj) {
          linkObj = {};
        }
      }
      return [link, linkObj];
    }).value());
    commit('setCurSearchVisitedLinks', _.fromPairs(linkObjPairs));
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
