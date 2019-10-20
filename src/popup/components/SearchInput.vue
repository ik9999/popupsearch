<template>
  <div class="SearchInput">
    <div class="SearchInput-inputCont">
      <input
        type="text" class="SearchInput-input form-control" id="auto1" placeholder=""
        v-on:keyup.esc.stop.prevent="unfocus" v-on:focus="onFocus" v-model="keyword"
      />
    </div>
    <button type="button" class="btn btn-primary SearchInput-button" @click.prevent="submit(keyword, $event)">
      <i class="fa fa-search" />
    </button>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import 'jquery-autocomplete/jquery.autocomplete.js';
import 'jquery-autocomplete/jquery.autocomplete.css';
import _ from 'lodash';
import Mousetrap from 'mousetrap';

export default {
  data() {
    return {
      $elem: undefined,
      $elemInput: undefined,
      keyword: '',
      HI: undefined,
      lastSubmittedKeyword: undefined,
      lastNonEmptyKeyword: undefined,
      setKeywordsFn: undefined
    }
  },
  computed: {
    ...mapState({
      focusedElement: state => state.ui.focusedElement,
      currentKeyword: state => state.keywords.currentKeyword,
    }),
    ...mapGetters({
      relatedKeywordList: 'keywords/getRelatedKeywords'
    })
  },
  methods: {
    unfocus() {
      this.$elem.blur();
    },
    onFocus() {
      if (this.$elem) {
        this.$elem.select();
      }
      this.$store.commit('ui/setFocusedElement', 'searchinput');
    },
    submit(keyword, event) {
      if (keyword !== this.lastSubmittedKeyword) {
        this.lastSubmittedKeyword = keyword;
        let keyModifier = '';
        if (event.altKey) {
          keyModifier = 'Alt';
        } else if (event.shiftKey) {
          keyModifier = 'Shift';
        } else if (event.ctrlKey) {
          keyModifier = 'Ctrl';
        }
        this.$store.dispatch('searchresults/search', {
          keyword: _.trim(keyword),
          keyModifier,
          forceUpdateDbTime: true
        });
      }
      this.$store.commit('ui/setFocusedElement', 'searchresults');
    }
  },
  watch: {
    focusedElement: function(val, oldVal) {
      if (val === 'searchinput') {
        this.$elem.focus();
      } else if (_.isEmpty(this.keyword)) {
        this.keyword = this.lastNonEmptyKeyword || this.lastSubmittedKeyword;
      }
    },
    currentKeyword: function(val, oldVal) {
      if (val && val.name !== this.keyword) {
        this.keyword = val.name;
        this.lastSubmittedKeyword = this.keyword;
        this.$elem.val(val.name);
      }
    },
    keyword: function(val) {
      if (!_.isEmpty(val)) {
        this.lastNonEmptyKeyword = val;
      }
    },
    relatedKeywordList: function(val) {
      if (this.setKeywordsFn && this.focusedElement === 'searchinput') {
        this.setKeywordsFn(_.map(val, ({visited, keyword}) => {
          if (visited) {
            return `<span class="visited">${keyword}</span>`;
          }
          return `<span>${keyword}</span>`;
        }))
      }
    }
  },
  mounted() {
    if (this.$store.state.keywords.currentKeyword) {
      this.keyword = this.$store.state.keywords.currentKeyword.name;
    }
    this.$elem = $('.SearchInput-input');
    this.$elem.autocomplete({
      appendMethod: 'replace',
      showHint: false,
      source: [
        (query, add) => {
          this.setKeywordsFn = add;
          this.$store.dispatch('keywords/loadRelatedKeywords', query).then(() => {
          });
        }
      ],
      valid: function(value, query) {
        return true;
      },
    });
    if (this.focusedElement === 'searchinput') {
      this.$elem.focus();
    }
    this.$elem.on('selected.xdsoft', (event, keyword) => {
      setTimeout(() => {
        this.submit(keyword, event);
      }, 50);
    });
    this.$elemInput = $('.xdsoft_input');
    this.$elem.on('keydown.xdsoft input.xdsoft cut.xdsoft paste.xdsoft', (e, keyword) => {
      this.keyword = this.$elemInput.val();
    });
    this.HI = new Mousetrap(this.$elem[0]);
    this.HI.stopCallback = (e) => {
      return false;
    };
    if (this.clearInputKey) {
      this.HI.bind(this.clearInputKey.toLowerCase(), (event) => {
        this.$elem.val('');
        this.keyword = '';
      });
    }
    this.HI.bind('esc', (event) => {
      this.$store.commit('ui/setFocusedElement', 'searchresults');
      return false;
    });
    this.HI.bind('enter', (event) => {
      this.submit(this.$elemInput.val(), event);
      return false;
    });
    this.HI.bind('shift+enter', (event) => {
      this.submit(this.$elemInput.val(), event);
      return false;
    });
    this.HI.bind('ctrl+enter', (event) => {
      this.submit(this.$elemInput.val(), event);
      return false;
    });
    this.HI.bind('alt+enter', (event) => {
      this.submit(this.$elemInput.val(), event);
      return false;
    });
  },
  beforeDestroy() {
    this.HI.reset();
  },
  components: {
  }
}
</script>

<style lang="sass">
.SearchInput
  width: 100%
  &-inputCont
    width: calc(100% - 50px)
    display: inline-block
    .visited
      color: #609
  &-button
    display: inline-block
    width: 45px
    height: 38px
    position: relative
    top: -1px
</style>

