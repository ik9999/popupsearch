<template>
  <div
    class="Index"
    :class="{'Index--latestKeyword': isLatestKeywordOpened, 'Index--oldestResult': isOldestKeywordOpened}"
  >
    <search-input></search-input>
    <search-results ref="SearchResults" class="Index-searchResults"></search-results>
    <div class="row Index-uiRow">
      <template v-if="!isError">
        <div class="col-4">
          <span @click.prevent="goPrev">
            <i class="fa fa-arrow-left Index-arrowLeft" />
          </span>
          <router-link to="/history" >History [{{ toggleHistoryKey }}]</router-link>
        </div>
        <div class="col-4 text-center">
          <pulse-loader :loading="isLoadingResults" :color="'#007bff'" :size="'11px'"></pulse-loader>
        </div>
        <div class="col-4 text-right">
          <span @click.prevent="goNext">
            <i class="fa fa-arrow-right Index-arrowRight" />
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg" aria-hidden="true" data-prefix="fa" data-icon="arrow-right"
            viewBox="0 0 535.28589 436.74945" width="11.5" height="11.5" class="Index-arrowLast"
            @click.prevent="goLast"
          >
            <path d="M190.5 29.25l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 201.35c9.4 9.4 9.4 24.6 0 33.9l-194.4 194.4c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3l120.5-114.8H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 63.55c-9.8-9.3-10-24.8-.4-34.3z" fill="currentColor"/>
            <path d="M467.0192042 18.4296324v400.1319872c0 10.03967532 7.6458669 18.1878176 17.0666672 18.1878176h34.1333344c9.4208003 0 17.0666672-8.14814228 17.0666672-18.1878176V18.4296324c0-10.03967532-7.6458669-18.1878176-17.0666672-18.1878176h-34.1333344c-9.4208003 0-17.0666672 8.14814228-17.0666672 18.1878176z" fill="currentColor" class="active-path"/>
          </svg>
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
import Mousetrap from 'mousetrap';
import { mapGetters, mapState, mapActions } from 'vuex';

export default {
  data() {
    return {
      HI: undefined
    }
  },
  computed: {
    ...mapState({
      focusedElement: state => state.ui.focusedElement,
      toggleHistoryKey: state => state.settings.settings.toggleHistoryKey,
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
    },
    isLatestKeywordOpened() {
      let currentKeyword = this.$store.state.keywords.currentKeyword;
      if (!currentKeyword) {
        return false;
      }
      return currentKeyword.id >= this.$store.state.keywords.lastNonRedirectKeywordId;
    },
    isOldestKeywordOpened() {
      let currentKeyword = this.$store.state.keywords.currentKeyword;
      if (!currentKeyword) {
        return false;
      }
      return currentKeyword.id === this.$store.state.keywords.oldestKeywordId;
    }
  },
  methods: {
    ...mapActions({
      goPrev: 'keywords/goPrev',
      goNext: 'keywords/goNext',
      goLast: 'keywords/goLast',
    }),
    openError() {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        let tab = tabs[0];
        chrome.tabs.create({
          url: this.errorPageUrl,
          active: true,
          index: tab.index + 1,
        });
      });
    },
  },
  mounted() {
    this.HI = new Mousetrap(this.$el);
    this.HI.stopCallback = (e) => {
      return false;
    };
    this.HI.bind(this.toggleHistoryKey.toLowerCase(), () => {
      this.$router.push('/history');
      return false;
    });
    _.each([this.focusInputKey, this.focusInputAltKey], (key) => {
      if (!key) {
        return ;
      }
      let focusInptuKey = key.toLowerCase();
      this.HI.bind(focusInptuKey, (event) => {
        if (this.focusedElement === 'searchinput') {
          this.$store.commit('ui/setFocusedElement', 'searchresults');
        } else if (this.focusedElement === 'searchresults') {
          this.$store.commit('ui/setFocusedElement', 'searchinput');
        }
        return false;
      });
    });
  },
  beforeDestroy() {
    this.HI.reset();
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
  &-arrowLast, &-arrowRight, &-arrowLeft
    cursor: pointer
    color: #007bff
  &--latestKeyword
    .Index-arrowLast, .Index-arrowRight
      cursor: auto
      color: #6c757d
  &--oldestResult
    .Index-arrowLeft
      cursor: auto
      color: #6c757d
  &-searchResults
    width: 100%
    height: calc(100% - 62px)
    margin-top: 4px
  &-uiRow
    height: 20px
    font-size: 11px
    > div
      svg
        position: relative
        top: -2px
      line-height: 20px
  &-options
    line-height: 16px
  &-newTabCb
    margin-top: 2px;
  &-iconToNewestRes
    height: 10px
    width: 15px
</style>
