<template>
  <div class="Index">
    <search-input></search-input>
    <search-results ref="SearchResults" class="Index-searchResults"></search-results>
    <div class="row Index-uiRow">
      <div class="col-1"></div>
      <div class="col-3"></div>
      <div class="col-4">
        <div class="form-group form-check mb-0 Index-options text-center">
          <input type="checkbox" class="form-check-input Index-newTabCb" v-model="closeAfterLink">
          <label class="form-check-label">
            {{ (toggleClosepopupKey ? '[' + toggleClosepopupKey.toLowerCase() + ']' : '') }}
            Close after opening a link
          </label>
        </div>
      </div>
      <div class="col-3"></div>
      <div class="col-1"></div>
    </div>
  </div>
</template>

<script>
import SearchInput from '../../components/SearchInput.vue';
import SearchResults from '../../components/SearchResults.vue';
import { mapState } from 'vuex';
import HumanInput from 'humaninput/dist/humaninput-full.min';

export default {
  data() {
    return {
      HI: undefined
    }
  },
  computed: {
    ...mapState({
      toggleClosepopupKey: state => state.settings.settings.toggleClosepopupKey,
      closeAfterLink: state => state.settings.settings.closeAfterLink,
    })
  },
  mounted() {
    this.HI = new HumanInput(this.$el);
    this.HI.filter = (e) => {
      return true;
    };
    this.HI.on(this.toggleClosepopupKey.toLowerCase().replace('+', '-'), () => {
      this.$store.commit('settings/setProp', {prop: 'closeAfterLink', val: !this.closeAfterLink});
    });
  },
  components: {
    SearchInput,
    SearchResults,
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
