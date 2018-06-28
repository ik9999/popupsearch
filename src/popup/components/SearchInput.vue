<template>
  <div class="SearchInput">
    <div class="SearchInput-inputCont">
      <input
        type="text" class="SearchInput-input form-control" id="auto1" placeholder=""
        v-on:keyup.esc.stop.prevent="unfocus" v-on:focus="onFocus"
      />
    </div>
    <button type="button" class="btn btn-primary SearchInput-button" @click.prevent="submit()">
      <font-awesome-icon icon="search" />
    </button>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import 'jquery-autocomplete/jquery.autocomplete.js';
import 'jquery-autocomplete/jquery.autocomplete.css';
import _ from 'lodash';
import HumanInput from 'humaninput/dist/humaninput-1.1.15-full.min.js';

export default {
  data() {
    return {
      $elem: undefined,
      $elemInput: undefined,
      keyword: '',
      HI: undefined
    }
  },
  computed: {
    ...mapState({
      focusedElement: state => state.ui.focusedElement,
      clearInputKey: state => state.settings.settings.clearInputKey,
    }),
  },
  methods: {
    unfocus() {
      this.$elem.blur();
    },
    onFocus() {
      this.$store.commit('ui/setFocusedElement', 'searchinput');
    },
    submit(keyword) {
      if (_.isUndefined(keyword)) {
        keyword = this.keyword;
      }
      this.$store.dispatch('searchresults/search', {
        keyword
      });
      this.$store.commit('ui/setFocusedElement', 'searchresults');
    }
  },
  watch: {
    focusedElement: function(val, oldVal) {
      if (val === 'searchinput') {
        this.$elem.focus();
      }
    }
  },
  mounted() {
    this.$elem = $('.SearchInput-input');
    this.$elem.autocomplete({
      appendMethod: 'replace',
      showHint: false,
      source: [
        (query, add) => {
          this.$store.dispatch('keywords/loadRemoteKeys', query).then(() => {
            if (this.focusedElement === 'searchinput') {
              add(this.$store.state.keywords.remoteKeywords);
            } else {
              add([]);
            }
          });
        }
      ],
      valid: function(value, query) {
        return true;
      },
    });
    this.$elem.focus();
    this.$elem.on('selected.xdsoft', (e, keyword) => {
      this.submit(keyword);
    });
    this.$elemInput = $('.xdsoft_input');
    this.$elem.on('keydown.xdsoft input.xdsoft cut.xdsoft paste.xdsoft', (e, keyword) => {
      this.keyword = this.$elemInput.val();
    });
    this.HI = new HumanInput(this.$elem[0]);
    this.HI.filter = (e) => {
      return true;
    };
    if (this.clearInputKey) {
      this.HI.on(this.clearInputKey.toLowerCase().replace('+', '-'), (event) => {
        this.$elem.val('');
        this.keyword = '';
      });
    }
    this.HI.on('enter', (event) => {
      console.log(event);
      this.keyword = this.$elemInput.val();
      this.submit();
      return false;
    });
  },
  components: {
    FontAwesomeIcon
  }
}
</script>

<style lang="sass">
.SearchInput
  width: 100%
  &-inputCont
    width: calc(100% - 50px)
    display: inline-block
  &-button
    display: inline-block
    width: 45px
    height: 38px
    position: relative
    top: -1px
</style>

