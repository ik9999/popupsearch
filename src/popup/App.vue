<template>
  <div class="App">
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  data() {
    return {}
  },
  created() {
    this.$store.dispatch('settings/load').then(() => {
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
