<template>
  <input
    type="text" class="SearchInput form-control" id="auto1" placeholder="enter state"
    v-on:keyup.esc.stop.prevent="unfocus"
  />
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import 'jquery-autocomplete/jquery.autocomplete.js';
import 'jquery-autocomplete/jquery.autocomplete.css';

export default {
  data() {
    return {
      $elem: undefined
    }
  },
  methods: {
    unfocus() {
      this.$elem.blur();
    }
  },
  mounted() {
    this.$elem = $('.SearchInput');
    this.$elem.autocomplete({
      appendMethod: 'replace',
      source:[
        (query, add) => {
          this.$store.dispatch('keywords/loadRemoteKeys', query).then(() => {
            add(this.$store.state.keywords.remoteKeywords);
          });
        }
      ]
    });
    this.$elem.focus();
    this.$elem.on('selected.xdsoft', (e, keyword) => {
      this.$store.dispatch('searchresults/search', {
        keyword
      });
    });
  },
  components: {
    FontAwesomeIcon
  }
}
</script>

<style lang="sass">
</style>

