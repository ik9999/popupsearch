<template>
  <div class="SearchResults">
    <div class="SearchResults-result" v-for="resultData in currentSearchResults">
      {{ resultData.title }}
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      $elem: undefined
    }
  },
  computed: {
    ...mapGetters({
      currentSearchResults: 'searchresults/getCurrentSearchResults'
    })
  }
}
</script>

<style lang="sass">
.SearchResults
  width: 100%
</style>


