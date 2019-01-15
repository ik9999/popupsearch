import _ from 'lodash';

const state = {
  settings: {
    searchEngine: 'googleHTML',
    acSource: 'google',
    searxLanguage: 'all',
    searxInstances: 'searx.libmail.eu,searx.pofilo.fr,search.stinpriza.org,searx.me',
    searxSearchEngines: 'google,wikipedia',
    searxAutocompleteSource: 'google',
    closeAfterLink: false,
    focusInputKey: 'Ctrl+e',
    toggleHistoryKey: 'Ctrl+h',
    focusInputAltKey: 'Tab',
    clearInputKey: 'Ctrl+u',
    refreshResInputKey: 'Ctrl+r',
    jumpTopKey: 'Shift+g',
    jumpBottomKey: 'g g',
    scrollUpKey: 'k',
    scrollDownKey: 'j',
    openBgTabModifier: 'Shift',
    openActTabModifier: '',
    openCurTabModifier: 'Ctrl',
    showMoreModifier: 'Alt',
    openPrevResult: 'left',
    openNextResult: 'right',
    openLastResult: 'Ctrl+right',
  },
  keyModifierList: ['Ctrl', 'Shift', 'Alt', ''],
};

const getters = {
  searxInstanceList(state) {
    return state.settings.searxInstances.split(',');
  }
};

const mutations = {
  setSettings(state, newSettings) {
    state.settings = _.extend(state.settings, newSettings);
  },
  setProp(state, {prop, val}) {
    state.settings[prop] = val;
  }
};

const actions = {
  load({commit, state}) {
    return Promise.all([new Promise(resolveFn => {
      chrome.storage.local.get(state.settings, (items) => {
        commit('setSettings', items);
        resolveFn();
      });
    })]);
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
