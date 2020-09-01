<template>
  <div class="SearchResults" tabindex="-1" @scroll="onScroll" @focus="onFocus">
    <template v-for="(resultData, index) in currentSearchResults">
      <search-result
        :result="resultData" class="SearchResults-result" :ref="'element' + index"
      >
      </search-result>
    </template>
    <h5 class="text-center" v-if="isShowingResults && currentSearchResults.length === 0">
      No results found
    </h5>
  </div>
</template>

<script>
import _ from 'lodash';
import { mapGetters, mapState } from 'vuex';
import SearchResult from './SearchResult.vue';
import Mousetrap from 'mousetrap';
import KeyboardLayout from '../helper/KeyboardLayout.js';

export default {
  data() {
    return {
      $elem: undefined,
      urlByKeys: {},
      callbackFnByKeys: {},
      lettersByNums: {},
      reservedKeys: [],
      initialLastVisibleResIdx: undefined,
      lastVisibleResIdx: 0,
      isScrolling: false
    }
  },
  computed: {
    ...mapState({
      focusedElement: state => state.ui.focusedElement,
      scrollPos: state => state.ui.scrollPos,

      isShowingResults: state => state.searchresults.isShowingResults,
      isLoadingResults: state => state.searchresults.isLoadingResults,
      isEnd: state => state.searchresults.isEnd,
      scrollUpKey: state => state.settings.settings.scrollUpKey,
      scrollDownKey: state => state.settings.settings.scrollDownKey,
      jumpTopKey: state => state.settings.settings.jumpTopKey,
      jumpBottomKey: state => state.settings.settings.jumpBottomKey,
      toggleClosepopupKey: state => state.settings.settings.toggleClosepopupKey,
      closeAfterLink: state => state.settings.settings.closeAfterLink,
      focusInputKey: state => state.settings.settings.focusInputKey,
      focusInputAltKey:  state => state.settings.settings.focusInputAltKey,
      toggleHistoryKey: state => state.settings.settings.toggleHistoryKey,
      openPrevResult: state => state.settings.settings.openPrevResult,
      openNextResult: state => state.settings.settings.openNextResult,
      openLastResult: state => state.settings.settings.openLastResult,
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
    currentSearchResults: function(val, oldVal) {
      if (_.size(oldVal) === 0) {
        this.initialLastVisibleResIdx = undefined;
      }
      this.$nextTick(() => {
        this.updateControls();
        this.$el.focus();
        if (this.scrollPos > 0) {
          this.$el.scrollTop = this.scrollPos;
        }
      });
    }
  },
  methods: {
    onFocus() {
      this.$store.commit('ui/setFocusedElement', 'searchresults');
    },
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
      this.callbackFnByKeys = {};
      const scrollHeight = this.$el.scrollHeight;
      const elHeight = this.$el.offsetHeight;
      const resultMarginSize = 14;
      const scrollOffset = this.$el.scrollTop;
      if (!this.isScrolling) {
        this.lastVisibleResIdx = 0;
      }

      let incHeight = 0;
      let keyNum = 1;
      let keyLetter = 'a';
      _.each(this.currentSearchResults, (resultData, resIdx) => {
        let resultComp = this.$refs[`element${resIdx}`][0];
        if (incHeight >= scrollOffset && incHeight <= scrollOffset + elHeight) {
          let key = undefined;
          if (keyNum < 10) {
            key = keyNum;
          } else if (keyNum === 10) {
            key = 0;
          } else {
            key = keyLetter;
            keyLetter = this.nextChar(keyLetter);
          }
          resultComp.setKey(key);
          this.urlByKeys[String(key)] = resultData.href;
          this.callbackFnByKeys[String(key)] = keyModifierType => {
            resultComp.triggerPressMainLink(keyModifierType);
          };
          keyNum += 1;
          _.each(resultData.subLinkList, (linkData, linkIdx) => {
            this.urlByKeys[String(keyLetter)] = linkData.href;
            this.callbackFnByKeys[String(keyLetter)] = () => {
              resultComp.triggerPressSubLink(linkIdx);
            };
            resultComp.setSublinkKey(keyLetter, linkIdx);
            keyLetter = this.nextChar(keyLetter);
          });
          if (!this.isScrolling) {
            this.lastVisibleResIdx = resIdx;
          }
        } else {
          resultComp.setKey(undefined);
          resultComp.setSublinkKey(undefined);
        }
        incHeight += resultComp.getHeight() + resultMarginSize;
      });
      if (_.isUndefined(this.initialLastVisibleResIdx)) {
        this.initialLastVisibleResIdx = this.lastVisibleResIdx;
      }
      if (scrollHeight - scrollOffset - elHeight < 200 && !this.isLoadingResults && !this.isEnd) {
        this.$store.dispatch('searchresults/search', {});
      }
    },
    onScroll() {
      this.updateControls();
      const pos = this.$el.scrollTop;
      this.$store.dispatch('ui/setScrollPos', {pos});
    },
    scroll(pos) {
      this.$el.scrollTop = pos;
    }
  },
  mounted() {
    this.reservedKeys = _.map([
      this.toggleClosepopupKey, this.scrollUpKey, this.scrollDownKey, this.focusInputKey,
      this.jumpTopKey, this.jumpBottomKey, this.focusInputAltKey, this.toggleHistoryKey,
      this.openPrevResult, this.openNextResult, this.openLastResult, 'n'
    ], (key) => {
      if (!_.isString(key)) {
        return undefined;
      }
      key = key.toLowerCase();
      let keySplit = key.split(/\+|-| /);
      let oneCharKeyParts = _.filter(keySplit, (keyPart) => {
        return _.isString(keyPart) && keyPart.length === 1;
      });
      return oneCharKeyParts;
    });
    this.reservedKeys = _.without(_.flatten(this.reservedKeys), '', undefined);
    if (this.currentSearchResults.length > 0) {
      this.updateControls();
    }
    if (this.scrollPos) {
      this.$el.scrollTop = this.scrollPos;
    }
    if (this.focusedElement === 'searchresults') {
      this.$el.focus();
    }
    let $this = $(this.$el);
    this.HI = new Mousetrap(this.$el);
    let allKeys = _.concat(
      Array.from({ length: 26 }, (_, i) => String.fromCharCode('a'.charCodeAt(0) + i)),
      _.map(_.range(0, 10), (i) => String(i))
    );
    _.each(allKeys, (key) => {
      if (_.includes(this.reservedKeys, key)) {
        return ;
      }
      let layoutKeys = KeyboardLayout.getMatchingKeys(key);
      _.each(this.$store.state.settings.keyModifierList, (keyModifier) => {
        let modifiedKeys = layoutKeys;
        if (keyModifier !== '') {
          modifiedKeys = [`${keyModifier.toLowerCase()}+${key}`];
        }
        this.HI.bind(modifiedKeys, async(event) => {
          event.preventDefault();
          let modType = await this.$store.dispatch('links/openLink', {url: this.urlByKeys[key], keyModifier});
          if (this.callbackFnByKeys[key]) {
            this.callbackFnByKeys[key](modType);
          }
        });
      });
    });
    let lastScrollPos;
    let scrollUpKeyList = _.concat(KeyboardLayout.getMatchingKeys(this.scrollUpKey), 'up');
    let scrollDownKeyList = _.concat(KeyboardLayout.getMatchingKeys(this.scrollDownKey), 'down');
    this.HI.bind(scrollUpKeyList, (event) => {
      let scrollPos;
      this.isScrolling = true;
      if (this.lastVisibleResIdx > 0) {
        if (this.lastVisibleResIdx - 1 >= 0 && !_.isEmpty(this.$refs[`element${this.lastVisibleResIdx - 1}`])) {
          let prevResComp = this.$refs[`element${this.lastVisibleResIdx - 1}`][0];
          scrollPos = prevResComp.$el.offsetTop + prevResComp.$el.offsetHeight - this.$el.offsetHeight;
          if (scrollPos < 0) {
            scrollPos = 0;
          }
          if (this.initialLastVisibleResIdx && this.lastVisibleResIdx - 1 >= this.initialLastVisibleResIdx) {
            this.lastVisibleResIdx -=1;
          }
        } else {
          scrollPos = 0;
        }
        if (scrollPos !== lastScrollPos) {
          lastScrollPos = scrollPos;
          $this.clearQueue().animate({scrollTop: scrollPos}, 200);
        }
      }
      return false;
    }, 'keydown');
    this.HI.bind(scrollDownKeyList, (event) => {
      let scrollPos;
      this.isScrolling = true;
      if (this.lastVisibleResIdx > 0) {
        if (!_.isEmpty(this.$refs[`element${this.lastVisibleResIdx + 1}`])) {
          let nextResComp = this.$refs[`element${this.lastVisibleResIdx + 1}`][0];
          scrollPos = nextResComp.$el.offsetTop + nextResComp.$el.offsetHeight - this.$el.offsetHeight;
          if (this.lastVisibleResIdx + 1 < this.currentSearchResults.length) {
            this.lastVisibleResIdx +=1;
          }
        } else {
          scrollPos = this.$el.scrollHeight - this.$el.offsetHeight;
        }
        if (scrollPos !== lastScrollPos) {
          lastScrollPos = scrollPos;
          $this.clearQueue().animate({scrollTop: scrollPos}, 200);
        }
      }
      return false;
    }, 'keydown');
    this.HI.bind([this.scrollUpKey, this.scrollDownKey, 'up', 'down'], (event) => {
      this.isScrolling = false;
    }, 'keyup');
    this.HI.bind(this.jumpTopKey.toLowerCase(), (event) => {
      this.$el.scrollTop = 0;
    });
    this.HI.bind(this.jumpBottomKey.toLowerCase(), (event) => {
      const scrollHeight = this.$el.scrollHeight;
      const elHeight = this.$el.offsetHeight;
      this.$el.scrollTop = scrollHeight - elHeight;
    });
    this.HI.bind(this.openPrevResult, () => {
      this.$store.dispatch('keywords/goPrev');
      return false;
    });
    this.HI.bind(this.openNextResult, (event) => {
      this.$store.dispatch('keywords/goNext');
      return false;
    });
    this.HI.bind(this.openLastResult.toLowerCase(), () => {
      this.$store.dispatch('keywords/goLast');
      return false;
    });
  },
  beforeDestroy() {
    this.HI.reset();
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
  position: relative
</style>
