import _ from 'lodash';

const state = {
};

const getters = {
};

const mutations = {
};

const actions = {
  openLink({rootState}, {url, keyModifier, keyModifierType}) {
    if (!url) {
      return ;
    }
    let keyModifierTypeList = ['openBgTabModifier', 'openActTabModifier', 'openCurTabModifier'];
    if (_.isUndefined(keyModifierType)) {
      keyModifierType = _.find(keyModifierTypeList, (_keyModifierType) => {
        return rootState.settings.settings[_keyModifierType] === keyModifier;
      })
    }
    switch (keyModifierType) {
    case 'openBgTabModifier':
      chrome.tabs.create({
        url,
        active: false
      });
      break;
    case 'openActTabModifier':
      chrome.tabs.create({
        url,
        active: true
      });
      break;
    case 'openCurTabModifier':
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          var tab = tabs[0];
          chrome.tabs.update(tab.id, {url});
        });
        setTimeout(() => {
          window.close();
        }, 500);
      break;
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};

