import _ from 'lodash';
import googleHTML from '../../search/googleHTML.js';
import Vue from 'vue';

const state = {
  searches: {},
};

const getters = {
  getCurrentSearchResults(state, getters, rootState) {
    const searchEngine = rootState.settings.settings.searchEngine;
    const keyword = rootState.keywords.currentKeyword;
    if (_.isEmpty(keyword) || !_.hasIn(state.searches, `[${searchEngine}][${keyword}]`)) {
      return [];
    }
    return _.get(state.searches, `[${searchEngine}][${keyword}]`);
  }
};

const mutations = {
  appendSearchResults(state, {searchEngine, keyword, links, forceNew}) {
    if (_.isUndefined(state.searches[searchEngine])) {
      Vue.set(state.searches, searchEngine, {});
    }
    if (_.isUndefined(state.searches[searchEngine][keyword]) || forceNew) {
      Vue.set(state.searches[searchEngine], keyword, []);
    }
    state.searches[searchEngine][keyword] = _.concat(
      state.searches[searchEngine][keyword], links
    );
  }
};

const actions = {
  load({commit, state}) {
    return new Promise(resolveFn => {
      resolveFn();
    });
  },
  search({rootState, commit, state, dispatch}, params) {
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
    return (new Promise((resolveFn) => {
      switch (searchEngine) {
      case 'googleHTML':
        googleHTML(keyword, start).then((result) => {
          let links = [];
          if (_.size(_.get(result, 'links')) > 0) {
            links = _.get(result, 'links');
          }
          commit('appendSearchResults', {searchEngine, keyword, links, forceNew});
        });
        break;
      }
    }));
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
