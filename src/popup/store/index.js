import Vue from 'vue';
import Vuex from 'vuex';
import settings from './modules/Settings.js';
import keywords from './modules/Keywords.js';
import searchresults from './modules/SearchResults.js';
import links from './modules/Links.js';
import ui from './modules/UI.js';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    settings,
    keywords,
    searchresults,
    ui,
    links
  },
});
