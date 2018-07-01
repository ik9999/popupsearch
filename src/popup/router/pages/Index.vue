<template>
  <div class="Index">
    <search-input></search-input>
    <search-results ref="SearchResults" class="Index-searchResults"></search-results>
    <div class="row Index-uiRow">
      <div class="col-1"></div>
      <div class="col-3"></div>
      <div class="col-4 text-center">
        <pulse-loader :loading="isLoadingResults" :color="'#007bff'" :size="'11px'"></pulse-loader>
      </div>
      <div class="col-3"></div>
      <div class="col-1"></div>
    </div>
  </div>
</template>

<script>
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
      isLoadingResults: state => state.searchresults.isLoadingResults,
    })
  },
  mounted() {
    this.HI = new Mousetrap(this.$el);
    this.HI.stopCallback = (e) => {
      return false;
    };
    this.HI.bind(this.toggleClosepopupKey.toLowerCase(), () => {
      this.$store.commit('settings/setProp', {prop: 'closeAfterLink', val: !this.closeAfterLink});
    });
    if (this.focusInputKey) {
      let focusInptuKey = this.focusInputKey.toLowerCase();
      this.HI.bind(focusInptuKey, (event) => {
        if (this.focusedElement === 'searchinput') {
          this.$store.commit('ui/setFocusedElement', 'searchresults');
        } else if (this.focusedElement === 'searchresults') {
          this.$store.commit('ui/setFocusedElement', 'searchinput');
        }
      });
    }
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
