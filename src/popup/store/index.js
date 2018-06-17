import Vue from 'vue';
import Vuex from 'vuex';
import settings from './modules/Settings.js';
import keywords from './modules/Keywords.js';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    settings,
    keywords,
  },
});
