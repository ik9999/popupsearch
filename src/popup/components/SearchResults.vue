<template>
  <div class="SearchResults" tabindex="-1">
    <div class="SearchResults-result" v-for="resultData in currentSearchResults">
      <a :href="resultData.href" v-html="resultData.title"></a>
      <div class="SearchResults-link" v-html="resultData.link"></div>
      <div class="SearchResults-desc" v-html="resultData.description"></div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { mapGetters, mapState } from 'vuex';

export default {
  data() {
    return {
      $elem: undefined
    }
  },
  computed: {
    ...mapState({
      focusedElement: state => state.ui.focusedElement,
    }),
    ...mapGetters({
      currentSearchResults: 'searchresults/getCurrentSearchResults'
    })
  },
  watch: {
    focusedElement: function(val) {
      if (val === 'searchresults') {
        this.$el.focus();
      }
    },
    currentSearchResults: function(val) {
      if (_.size(val) > 0 && this.focusedElement === 'searchresults') {
        this.$nextTick(() => {
          this.$el.focus();
        });
      }
    }
  }
}
</script>

<style lang="sass">
.SearchResults
  &-result
    margin-bottom: 0.9rem
  overflow-y: overlay
  overflow-x: hidden
  &-desc
    line-height: 1.35
    font-size: 0.9rem
    em
      font-weight: bold
      font-style: normal
    .date
      color: #808080
      font-size: 0.9rem
    a
      font-size: 0.8rem
  &-link
    padding-left: 1px
    color: #006621
    font-size: 0.8rem
    line-height: 1.1
</style>


