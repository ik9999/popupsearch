<template>
  <div class="App">
    <router-view v-if="loaded"></router-view>
  </div>
</template>

<script>
import _ from 'lodash';

export default {
  data() {
    return {
      loaded: false
    }
  },
  async created() {
    await this.$store.dispatch('settings/load');
    await this.$store.dispatch('keywords/load');
    if (!_.isEmpty(this.$store.state.keywords.currentKeyword)) {
      try {
        await this.$store.dispatch('searchresults/search', {
          keyword: this.$store.state.keywords.currentKeyword,
        });
      } catch(e) {
      }
    }
    this.loaded = true;
  }
}
</script>

<style lang="sass">
body, .App
  width: 800px
  height: 600px
  overflow: hidden
.App
  padding: 4px 0
</style>
