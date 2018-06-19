import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Vue from 'vue'
import App from './App'
import store from './store'
import router from './router'

import fontawesome from '@fortawesome/fontawesome'
import faSearch from '@fortawesome/fontawesome-free-solid/faSearch'

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV !== 'production') {
  Vue.config.devtools = true;
}

fontawesome.library.add(faSearch)
window.store = store;

/* eslint-disable no-new */
window.App = new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
});
