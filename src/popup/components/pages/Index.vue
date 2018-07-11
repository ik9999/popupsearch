<template>
  <div class="Index">
    <search-input></search-input>
    <search-results ref="SearchResults" class="Index-searchResults"></search-results>
    <div class="row Index-uiRow">
      <template v-if="!isError">
        <div class="col-4">
          <router-link to="/history">History</router-link>
        </div>
        <div class="col-4 text-center">
          <pulse-loader :loading="isLoadingResults" :color="'#007bff'" :size="'11px'"></pulse-loader>
        </div>
      </template>
      <div class="col-12 text-center text-danger" v-if="isError">
        {{ errorMsg }}
        <a
          :href="errorPageUrl" class="font-weight-bold text-danger" @click.prevent="openError"
          v-if="errorPageUrl"
        >
          Open page
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import SearchInput from '../../components/SearchInput.vue';
import SearchResults from '../../components/SearchResults.vue';
import PulseLoader from 'vue-spinner/src/PulseLoader.vue';
import { mapState } from 'vuex';
import Mousetrap from 'mousetrap';

export default {
  data() {
    return {
      HI: undefined
    }
  },
  computed: {
    ...mapState({
      focusedElement: state => state.ui.focusedElement,
      toggleClosepopupKey: state => state.settings.settings.toggleClosepopupKey,
      closeAfterLink: state => state.settings.settings.closeAfterLink,
      focusInputKey: state => state.settings.settings.focusInputKey,
      focusInputAltKey: state => state.settings.settings.focusInputAltKey,
      isLoadingResults: state => state.searchresults.isLoadingResults,
      errorMsg: state => state.searchresults.errorMsg,
      errorPageUrl: state => state.searchresults.errorPageUrl,
    }),
    isError() {
      return this.$store.state.searchresults.isError || this.$store.state.keywords.error;
    },
    errorMsg() {
      return this.$store.state.searchresults.error || this.$store.state.keywords.error;
    }
  },
  methods: {
    openError() {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        let tab = tabs[0];
        chrome.tabs.create({
          url: this.errorPageUrl,
          active: true,
          index: tab.index + 1,
        });
      });
    }
  },
  mounted() {
    this.HI = new Mousetrap(this.$el);
    this.HI.stopCallback = (e) => {
      return false;
    };
    this.HI.bind(this.toggleClosepopupKey.toLowerCase(), () => {
      this.$store.commit('settings/setProp', {prop: 'closeAfterLink', val: !this.closeAfterLink});
    });
    _.each([this.focusInputKey, this.focusInputAltKey], (key) => {
      if (key) {
        let focusInptuKey = key.toLowerCase();
        this.HI.bind(focusInptuKey, (event) => {
          if (this.focusedElement === 'searchinput') {
            this.$store.commit('ui/setFocusedElement', 'searchresults');
          } else if (this.focusedElement === 'searchresults') {
            this.$store.commit('ui/setFocusedElement', 'searchinput');
          }
          return false;
        });
      }
    });
  },
  beforeDestroy() {
    this.HI.off();
  },
  components: {
    SearchInput,
    SearchResults,
    PulseLoader,
  }
}
</script>

<style lang="sass">
.Index
  height: 100%
  width: 100%
  padding: 0 8px
  &-searchResults
    width: 100%
    height: calc(100% - 62px)
    margin-top: 4px
  &-uiRow
    height: 16px
    font-size: 11px
  &-options
    line-height: 16px
  &-newTabCb
    margin-top: 2px;
</style>
