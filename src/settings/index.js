import Vue from 'vue'
import root from './root.vue'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

Vue.config.productionTip = false
/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(root)
})
