<template>
  <input
    type="text" class="SearchInput form-control" id="auto1" placeholder="enter state" 
    v-on:keyup.enter.stop.prevent="submit"
  />
</template>

<script>
import FontAwesomeIcon from '@fortawesome/vue-fontawesome';
import 'jquery-autocomplete/jquery.autocomplete.js';
import 'jquery-autocomplete/jquery.autocomplete.css';

export default {
  data() {
    return {}
  },
  methods: {
    submit() {
    }
  },
  mounted() {
    $('.SearchInput').autocomplete({
      source:[
        (query, add) => {
          this.$store.dispatch('keywords/loadRemoteKeys', query).then(() => {
            add(this.$store.state.keywords.remoteKeys);
          });
        }
      ]
    });
    $('.SearchInput').focus();
  },
  components: {
    FontAwesomeIcon
  }
}
</script>

<style lang="sass">
</style>

