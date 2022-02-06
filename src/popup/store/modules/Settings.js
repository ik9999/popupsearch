import _ from 'lodash';

const state = {
  settings: {
    searchEngine: 'valueserp',
    acSource: 'google',
    valueSerpUrl: 'https://api.valueserp.com/search?api_key=api_key&q={q}&page={page}',
    valueSerpSimultaneousReqs: 2,
    searxLanguage: 'all',
    searxInstances: 'searx.fmac.xyz,searx.gnu.style,search.mdosch.de',
    searxSearchEngines: 'google,wikipedia',
    searxAutocompleteSource: 'google',
    closeAfterLink: false,
    removeHighlighting: false,
    focusInputKey: 'Ctrl+e',
    toggleHistoryKey: 'Ctrl+h',
    focusInputAltKey: 'Tab',
    clearInputKey: 'Ctrl+u',
    refreshResInputKey: 'Ctrl+r',
    jumpTopKey: 'g g',
    jumpBottomKey: 'Shift+g',
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
