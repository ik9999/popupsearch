const state = {
  focusedElement: 'searchinput',
};

const getters = {
};

const mutations = {
  setFocusedElement(state, elementName) {
    state.focusedElement = elementName;
  }
};

const actions = {
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};

