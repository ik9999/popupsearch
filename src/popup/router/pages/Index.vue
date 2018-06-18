<template>
  <div class="Index px-2 pt-1">
    <search-input></search-input>
    <search-results ref="SearchResults"></search-results>
  </div>
</template>

<script>
import SearchInput from '../../components/SearchInput.vue';
import SearchResults from '../../components/SearchResults.vue';
export default {
  data() {
    return {}
  },
  components: {
    SearchInput,
    SearchResults,
  }
}
</script>

<style lang="sass">
</style>
