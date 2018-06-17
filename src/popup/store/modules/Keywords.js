import _ from 'lodash';
import axios from 'axios';

const state = {
  historyKeys: [],
  remoteKeys: []
};

const getters = {
};

const mutations = {
  setRemoteKeys(state, keys) {
    state.remoteKeys = keys;
  }
};

const actions = {
  load({commit, state}) {
    return new Promise(resolveFn => {
      resolveFn();
    });
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
            console.log(keywordList);
            commit('setRemoteKeys', keywordList);
            console.log(state.remoteKeys);
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
