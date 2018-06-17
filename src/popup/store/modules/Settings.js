import _ from 'lodash';

const state = {
  searchEngine: 'google',
  acSource: 'google',
};

const getters = {
};

const mutations = {
  setSettings(state, newSettings) {
    _.extend(state, newSettings);
  }
};

const actions = {
  load({commit, state}) {
    return new Promise(resolveFn => {
      chrome.storage.local.get(state, (items) => {
        commit('setSettings', items);
        resolveFn();
      });
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
