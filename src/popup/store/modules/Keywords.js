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
    return (new Promise((resolveFn) => {
      if (!_.isString(keyword) || _.isEmpty(keyword)) {
        return resolveFn([]);
      }
      let isBang = false;
      let bang = '';
      if (keyword[0] === '!') {
        isBang = true;
        let keywSplit = keyword.split(' ');
        if (keywSplit.length < 2) {
          return resolveFn([]);
        }
        bang = keywSplit.shift();
        keyword = keywSplit.join(' ');
        if (_.isEmpty(keyword)) {
          return resolveFn([]);
        }
      }
      switch (rootState.settings.settings.acSource) {
      case 'google':
        return resolveFn(axios.get('http://suggestqueries.google.com/complete/search?client=firefox', {
          params: {
            q: keyword
          }
        }).then((response) => {
          let keywordList = _.get(response, 'data[1]');
          if (_.isArray(keywordList)) {
            keywordList = _.without(keywordList, keyword);
            if (isBang) {
              return Promise.resolve(_.map(keywordList, res => bang + ' ' + res));
            }
            return Promise.resolve(keywordList);
          }
          return Promise.resolve([]);
        }));
        break;
      }
      return resolveFn([]);
    })).then((keywordList) => {
      commit('setRemoteKeywords', _.without(keywordList, keyword));
      return Promise.resolve(keywordList);
    });
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
