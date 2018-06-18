import _ from 'lodash';
import axios from 'axios';

const state = {
  historyKeywords: [],
  remoteKeywords: [],
  currentKeyword: '',
};

const getters = {
};

const mutations = {
  setRemoteKeywords(state, keywords) {
    state.remoteKeywords = keywords;
  },
  setCurrentKeyword(state, keyword) {
    state.currentKeyword = keyword;
    state.historyKeywords.push(keyword);
  },
};

const actions = {
  load({commit, state}) {
    return new Promise(resolveFn => {
      resolveFn();
    });
  },
  updateCurrentKeyword({commit, state}, keyword) {
    commit('setCurrentKeyword', keyword);
  },
  loadRemoteKeys({rootState, commit, state}, keyword) {
    if (!_.isString(keyword) || _.isEmpty(keyword)) {
      return Promise.resolve([]);
    }
    return (new Promise((resolveFn) => {
      switch (rootState.settings.acSource) {
      case 'google':
        axios.get('http://suggestqueries.google.com/complete/search?client=firefox', {
          params: {
            q: keyword
          }
        }).then((response) => {
          let keywordList = _.get(response, 'data[1]');
          if (_.isArray(keywordList)) {
            commit('setRemoteKeywords', keywordList);
            resolveFn(keywordList);
            return ;
          }
          resolveFn([]);
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
