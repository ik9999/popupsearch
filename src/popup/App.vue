<template>
  <div class="App">
    <router-view v-if="loaded"></router-view>
  </div>
</template>

<script>

export default {
  data() {
    return {
      loaded: false
    }
  },
  created() {
    this.$store.dispatch('settings/load').then(() => {
      this.loaded = true;
      return this.$store.dispatch('keywords/load');
    });
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
