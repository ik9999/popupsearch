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
    console.log('here');
    let keyModifierTypeList = ['openBgTabModifier', 'openActTabModifier', 'openCurTabModifier'];
    if (_.isUndefined(keyModifierType)) {
      keyModifierType = _.find(keyModifierTypeList, (_keyModifierType) => {
        return rootState.settings.settings[_keyModifierType] === keyModifier;
      })
    }
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      let tab = tabs[0];
      switch (keyModifierType) {
      case 'openBgTabModifier':
        chrome.tabs.create({
          url,
          active: false,
          index: tab.index + 1,
        });
        break;
      case 'openActTabModifier':
        chrome.tabs.create({
          url,
          active: true,
          index: tab.index + 1,
        });
        break;
      case 'openCurTabModifier':
        chrome.tabs.update(tab.id, {url});
        setTimeout(() => {
          window.close();
        }, 500);
        break;
      }
    });
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};

