import _ from 'lodash';

const state = {
  focusedElement: 'searchinput',
  scrollPos: 0
};

const getters = {
};

const mutations = {
  setFocusedElement(state, elementName) {
    state.focusedElement = elementName;
  },
  _setScrollPos(state, val) {
    state.scrollPos = val;
  }
};

const actions = {
  setScrollPos({commit, dispatch}, {pos}) {
    if (!_.isFinite(pos)) {
      return ;
    }
    commit('_setScrollPos', pos);
    dispatch('searchresults/updateDbScrollPos', {pos}, {root:true});
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};

