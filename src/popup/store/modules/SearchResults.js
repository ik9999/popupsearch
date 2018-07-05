import _ from 'lodash';
import googleHTML from '../../search/googleHTML.js';
import Vue from 'vue';
import querystring from 'querystring-browser';

const state = {
  searches: {},
  isLoadingResults: false,
  isShowingResults: false,
  isEnd: false,
  isError: false,
  errorMsg: undefined,
  errorPageUrl: undefined
};

const getters = {
  getCurrentSearchResults(state, getters, rootState) {
    const searchEngine = rootState.settings.settings.searchEngine;
    const keyword = rootState.keywords.currentKeyword;
    if (
      _.isEmpty(keyword) || _.isUndefined(state.searches[searchEngine]) ||
      _.isUndefined(state.searches[searchEngine][keyword])
    ) {
      return [];
    }
    return state.searches[searchEngine][keyword];
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
  }
};

const actions = {
  load({commit, state}) {
    return new Promise(resolveFn => {
      resolveFn();
    });
  },
  search({rootState, commit, state, dispatch, getters}, params) {
    if (!params.keyword) {
      params.keyword = rootState.keywords.currentKeyword;
      params.start = getters.getCurrentSearchResults.length + 1;
    }
    params = _.extend({
      start: 0,
      forceNew: false
    }, params);
    let searchEngine = rootState.settings.settings.searchEngine;
    let {keyword, start, forceNew} = params;
    if (!_.isString(keyword) || _.isEmpty(keyword)) {
      return Promise.resolve([]);
    }
    if (params.keyword[0] === '!' || params.keyword[0] === '=') {
      let keywordEscaped = querystring.escape(params.keyword);
      let url;
      if (params.keyword[0] === '!') {
        url = `https://api.duckduckgo.com/?q=${keywordEscaped}&format=json&pretty=1`;
      }
      if (params.keyword[0] === '=') {
        url = `https://duckduckgo.com/?q=${keywordEscaped}`;
      }
      return dispatch('links/openLink', {
        url, 
        keyModifier: params.keyModifier,
      }, {root:true});
    }
    dispatch('keywords/updateCurrentKeyword', keyword, {root:true});
    commit('setIsLoading', true);
    return (new Promise((resolveFn) => {
      switch (searchEngine) {
      case 'googleHTML':
        googleHTML(keyword, start).then((result) => {
          let links = [];
          if (_.size(_.get(result, 'links')) > 0) {
            links = _.get(result, 'links');
          }
          commit('setError', {
            val: false
          });
          commit('appendSearchResults', {searchEngine, keyword, links, forceNew, start});
        }, (err) => {
          commit('setError', {
            val: true,
            msg: err.message,
            url: err.url
          });
          commit('appendSearchResults', {searchEngine, keyword, links: [], forceNew, start});
        }).finally(() => {
          commit('setIsLoading', false);
        });
        break;
      }
    }));
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
