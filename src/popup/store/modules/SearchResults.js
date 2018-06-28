import _ from 'lodash';
import googleHTML from '../../search/googleHTML.js';
import Vue from 'vue';

const state = {
  searches: {},
  isLoadingResults: false,
  isShowingResults: false,
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
    state.searches[searchEngine][keyword] = _.concat(
      state.searches[searchEngine][keyword], links
    );
    state.isShowingResults = true;
  },
  setIsLoading(state, value) {
    state.isLoadingResults = value;
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
          commit('appendSearchResults', {searchEngine, keyword, links, forceNew, start});
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
