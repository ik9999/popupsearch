<template>
  <div class="SearchResults" tabindex="-1">
    <template v-for="(resultData, index) in currentSearchResults">
      <search-result 
        :result="resultData" class="SearchResults-result" :ref="'element' + index"
      >
      </search-result>
    </template>
  </div>
</template>

<script>
import _ from 'lodash';
import { mapGetters, mapState } from 'vuex';
import SearchResult from './SearchResult.vue';

export default {
  data() {
    return {
      $elem: undefined,
      urlByNums: {},
      lettersByNums: {}
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
          updateControls();
          this.$el.focus();
        });
      }
    }
  },
  methods: {
    nextChar(c) {
      let i = (parseInt(c, 36) + 1) % 36;
      return (!i * 10 + i).toString(36);
    },
    updateControls() {
      this.urlByNums = {};
      this.lettersByNums = {};
      const scrollHeight = this.$el.scrollHeight;
      const elHeight = this.$el.offsetHeight;
      const resultMarginSize = 14;
      const scrollOffset = this.$el.scrollTop;

      let incHeight = 0;
      let keyNum = 1;
      let keyLetter = 'a';
      _.each(this.currentSearchResults, (resultData, resIdx) => {
        let resultComp = this.$refs[`element${resIdx}`];
        if (incHeight >= scrollOffset && incHeight <= scrollOffset + elHeight) {
          if (keyNum < 10) {
            resultComp.setKey(keyNum);
            this.urlByNums[String(keyNum)] = resultData.href;
          } else if (keyNum === 10) {
            resultComp.setKey(0);
            this.urlByNums[String(0)] = resultData.href;
          } else {
            resultComp.setKey(keyLetter);
            this.urlByNums[String(keyLetter)] = resultData.href;
            keyLetter = this.nextChar(keyLetter);
          }
          keyNum += 1;
          _.each(resultData.subLinkList, (linkData, linkIdx) => {
            this.urlByNums[String(keyLetter)] = linkData.href;
            resultComp.setSublinkKey(keyLetter, linkIdx);
            keyLetter = this.nextChar(keyLetter);
          });
        } else {
          resultComp.setKey(undefined);
          resultComp.setSublinkKey(undefined);
        }
      });
    }
  },
  components: {
    SearchResult,
  }
}
</script>

<style lang="sass">
.SearchResults
  &-result
    margin-bottom: 14px
  overflow-y: overlay
  overflow-x: hidden
</style>
