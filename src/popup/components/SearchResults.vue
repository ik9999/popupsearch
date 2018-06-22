<template>
  <div class="SearchResults" tabindex="-1" @scroll="updateControls">
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
import HumanInput from 'humaninput/dist/humaninput-full.min';

export default {
  data() {
    return {
      $elem: undefined,
      urlByKeys: {},
      lettersByNums: {},
      reservedKeys: []
    }
  },
  computed: {
    ...mapState({
      focusedElement: state => state.ui.focusedElement,
      scrollUpKey: state => state.settings.settings.scrollUpKey,
      scrollDownKey: state => state.settings.settings.scrollDownKey,
      toggleClosepopupKey: state => state.settings.settings.toggleClosepopupKey,
      closeAfterLink: state => state.settings.settings.closeAfterLink,
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
          this.updateControls();
          this.$el.focus();
        });
      }
    }
  },
  methods: {
    nextChar(c) {
      if (c === 'z') {
        return '';
      }
      let i = (parseInt(c, 36) + 1) % 36;
      let nextChar = (!i * 10 + i).toString(36);
      if (_.includes(this.reservedKeys, nextChar)) {
        return this.nextChar(nextChar);
      }
      return nextChar;
    },
    updateControls() {
      this.urlByKeys = {};
      this.lettersByNums = {};
      const scrollHeight = this.$el.scrollHeight;
      const elHeight = this.$el.offsetHeight;
      const resultMarginSize = 14;
      const scrollOffset = this.$el.scrollTop;

      let incHeight = 0;
      let keyNum = 1;
      let keyLetter = 'a';
      _.each(this.currentSearchResults, (resultData, resIdx) => {
        let resultComp = this.$refs[`element${resIdx}`][0];
        if (incHeight >= scrollOffset && incHeight <= scrollOffset + elHeight) {
          if (keyNum < 10) {
            resultComp.setKey(keyNum);
            this.urlByKeys[String(keyNum)] = resultData.href;
          } else if (keyNum === 10) {
            resultComp.setKey(0);
            this.urlByKeys[String(0)] = resultData.href;
          } else {
            resultComp.setKey(keyLetter);
            this.urlByKeys[String(keyLetter)] = resultData.href;
            keyLetter = this.nextChar(keyLetter);
          }
          keyNum += 1;
          _.each(resultData.subLinkList, (linkData, linkIdx) => {
            this.urlByKeys[String(keyLetter)] = linkData.href;
            resultComp.setSublinkKey(keyLetter, linkIdx);
            keyLetter = this.nextChar(keyLetter);
          });
        } else {
          resultComp.setKey(undefined);
          resultComp.setSublinkKey(undefined);
        }
        incHeight += resultComp.getHieght() + resultMarginSize;
      });
    },
    openLinkByKey(key, keyModifier) {
      if (!this.urlByKeys[key]) {
        return ;
      }
      switch (keyModifier) {
      case this.$store.state.settings.settings.openBgTabModifier:
        chrome.tabs.create({
          url: this.urlByKeys[key],
          active: false
        });
        break;
      case this.$store.state.settings.settings.openActTabModifier:
        chrome.tabs.create({
          url: this.urlByKeys[key],
          active: true
        });
        break;
      case this.$store.state.settings.settings.openCurTabModifier:
          chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            var tab = tabs[0];
            chrome.tabs.update(tab.id, {url: this.urlByKeys[key]});
          });
          window.close();
        break;
      }
    }
  },
  mounted() {
    let $this = $(this.$el);
    this.reservedKeys = _.map([this.toggleClosepopupKey, this.scrollUpKey, this.scrollDownKey], (key) => {
      if (!_.isString(key)) {
        return undefined;
      }
      key = key.toLowerCase();
      let keySplit = key.split(/\+|-/);
      let oneCharKeyParts = _.filter(keySplit, (keyPart) => {
        return _.isString(keyPart) && keyPart.length === 1;
      });
      return oneCharKeyParts;
    });
    this.reservedKeys = _.without(_.concat(this.reservedKeys), '', undefined);
    this.HI = new HumanInput(this.$el, {noKeyRepeat: false});
    let allKeys = _.concat(
      Array.from({ length: 26 }, (_, i) => String.fromCharCode('a'.charCodeAt(0) + i)),
      _.map(_.range(0, 10), (i) => String(i))
    );
    _.each(allKeys, (key) => {
      if (_.includes(this.reservedKeys, key)) {
        return ;
      }
      _.each(this.$store.state.settings.keyModifierList, (keyModifier) => {
        let modifiedkey = key;
        if (keyModifier !== '') {
          modifiedkey = `${keyModifier.toLowerCase()}-${key}`;
        }
        this.HI.on(modifiedkey, (event) => {
          this.openLinkByKey(key, keyModifier);
        });
      });
    });
    let next = undefined;
    this.HI.on([`keydown:${this.scrollUpKey}`, `keydown:${this.scrollDownKey}`], (event) => {
      if (next === undefined) {
        next = Date.now();   
      }
      if (next <= Date.now()) {
        next = Date.now() + 170;
        let cur;
        if (event.key === this.scrollDownKey) {
          cur =  this.$el.scrollTop;
          $this.animate({scrollTop: cur + 60}, 200);
        } else if (event.key === this.scrollUpKey) {
          cur = this.$el.scrollTop;
          $this.animate({scrollTop: cur - 60}, 200);
        }
      }
    });
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
