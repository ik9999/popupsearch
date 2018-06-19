<template>
  <div class="Index">
    <search-input></search-input>
    <search-results ref="SearchResults" class="Index-searchResults"></search-results>
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
.Index
  height: 100%
  width: 100%
  padding: 0 8px
  &-searchResults
    width: 100%
    height: calc(100% - 46px)
    margin-top: 4px
</style>
