<template>
  <div class="History">
    <datatable :columns="columns" :data="data" :total="total" :query="query" />
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  data() {
    return {
      columns: [
        { title: 'Keyword', field: 'name' },
        { title: 'Date', field: 'timestamp', sortable: true },
        { title: 'Opened links', field: 'links' },
      ],
      data: [],
      total: 0,
      query: {}
    };
  },
  watch: {
    query: {
      handler(query) {
        console.log(query);
      },
      deep: true
    }
  }
}
</script>

<style lang="sass">
</style>
