import _ from 'lodash';
import googleHTML from '../../search/googleHTML.js';
import searx from '../../search/searx.js';
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
    scrollPos: undefined,
    searchDateTS: undefined,
    pageNum: undefined
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
  appendSearchResults(state, {searchEngine, keyword, links, forceNew, start, pageNum}) {
    if (_.isUndefined(state.searches[searchEngine])) {
      Vue.set(state.searches, searchEngine, {});
    }
    if (_.isUndefined(state.searches[searchEngine][keyword]) || forceNew || start === 0 || pageNum === 1) {
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
  setResCacheData(state, {id, scrollPos, searchDateTS, pageNum}) {
    state.currentResultDbObj.id = id;
    state.currentResultDbObj.scrollPos = scrollPos;
    state.currentResultDbObj.searchDateTS = searchDateTS;
    state.currentResultDbObj.pageNum = pageNum;
  },
  setCurSearchVisitedLinks(state, visitedlinksObj) {
    state.curSearchVisitedLinks = visitedlinksObj;
  },
  setLinkVisited(state, {href, linkObj}) {
    state.curSearchVisitedLinks[href] = linkObj;
  }
};

const actions = {
  load() {
    return new Promise(resolveFn => {
      resolveFn();
    });
  },
  async search({rootState, commit, dispatch, getters, state, rootGetters}, params) {
    const searchEngine = rootState.settings.settings.searchEngine;
    if (searchEngine === 'googleHTML') {
      params.start = 0;
      if (!params.keyword && !params.forceNew) {
        params.start = getters.getCurrentSearchResults.length + 1;
      }
    } else if (searchEngine === 'searx') {
      params.pageNum = 1;
      if (!params.keyword && !params.forceNew) {
        params.pageNum = state.currentResultDbObj.pageNum + 1; //TODO: store in state.searches for each search result
      }
    }
    if (!params.keyword) {
      if (rootState.keywords.currentKeyword) {
        params.keyword = rootState.keywords.currentKeyword.name;
      }
    }
    params = _.extend({
      forceNew: false,
      forceUpdateDbTime: false
    }, params);
    let {keyword, start, pageNum, forceNew, forceUpdateDbTime} = params;
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
    if (forceNew) {
      await db.results.where({
        keyword,
        search_engine: searchEngine,
      }).delete();
    }
    if (!forceNew && (start === 0 || pageNum === 1)) {
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
          scrollPos: foundDbRes.last_scrolling_position,
          searchDateTS: foundDbRes.timestamp,
          pageNum: foundDbRes.page_num,
        });
        dispatch('updateVisitedLinks', {forceNew: true});
        commit('ui/setFocusedElement', 'searchresults', {root:true});
        dispatch('ui/setScrollPos', {pos: foundDbRes.last_scrolling_position}, {root:true});
      }
    }
    commit('setAreResultsFromCache', Boolean(isResInDb));

    if (!isResInDb) {
      let links = [];
      let result;
      let error;
      switch (searchEngine) {
      case 'googleHTML':
        try {
          result = await googleHTML(keyword, start);
        } catch(err) {
          error = err
        }
        break;
      case 'searx':
        await _.reduce(rootGetters['settings/searxInstanceList'], async(pr, domain) => {
          await pr;
          if (result) {
            return;
          }
          try {
            let _result = await searx(
              domain, rootState.settings.settings.searxLanguage, keyword, pageNum,
              rootState.settings.settings.searxSearchEngines
            );
            result = _result;
          } catch(e) {
            console.warn(e);
          }
        }, Promise.resolve());
        break;
      }
      if (!error && result) {
        if (_.size(_.get(result, 'links')) > 0) {
          links = _.get(result, 'links');
        }
        commit('setError', {
          val: false
        });
      } else {
        commit('setError', {
          val: true,
          msg: error ? error.message : 'Unknown error',
          url: error && error.url ? error.url : ''
        });
        setTimeout(() => {
          commit('setError', {
            val: false
          });
        }, 5000);
      }
      commit('appendSearchResults', {searchEngine, keyword, links, forceNew, start, pageNum});
    }

    dispatch('keywords/updateSearchedMoreKeywords', {
      resultUrlList: _.map(getters.getCurrentSearchResults, ({href, subLinkList}) => {
        if (_.size(subLinkList) > 0) {
          return href;
        }
      })
    }, {root:true});
    commit('setIsLoading', false);
    dispatch('updateVisitedLinks', {forceNew: (start === 0 || pageNum === 1 ? true : false)});

    if (!isResInDb) {
      let foundDbRes;
      let resDbId;
      if (_.isUndefined(isResInDb)) {
        foundDbRes = await db.results.where({
          keyword,
          search_engine: searchEngine,
        }).limit(1).first();
        if (foundDbRes) {
          resDbId = foundDbRes.id;
        }
      }
      let resultsJsonStr = JSON.stringify(getters.getCurrentSearchResults);
      if (isResInDb === false || !foundDbRes) {
        const resultDbObj = {
          keyword,
          search_engine: searchEngine,
          results_json_str: resultsJsonStr,
          last_scrolling_position: 0,
          timestamp: new Date().valueOf(),
        };
        if (pageNum) {
          resultDbObj.page_num = pageNum;
        }
        resDbId = await db.results.add(resultDbObj);
      } else {
        const modifyObj = {
          results_json_str: resultsJsonStr
        };
        if (pageNum) {
          modifyObj.page_num = pageNum;
        }
        await db.results.where({id: resDbId}).modify(modifyObj);
      }
      commit('setResCacheData', {id: resDbId, pageNum: pageNum});
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
