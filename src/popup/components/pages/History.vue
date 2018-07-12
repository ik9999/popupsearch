<template>
  <div class="History">
    <datatable class="History-datatable" :tbl-class="'History-table'"
      :columns="columns" :data="data" :total="total" :query="query" :HeaderSettings="false"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  data() {
    return {
      columns: [
        { title: 'Keyword', field: 'name', thClass: 'History-thName' },
        { title: 'Date', field: 'timestamp', thClass: 'History-thDate', sortable: true },
        { title: 'Opened links', field: 'links', thClass: 'History-thLinks' },
      ],
      query: {
        offset: 0,
        limit: 10,
        sort: 'timestamp',
        order: 'desc'
      }
    };
  },
  computed: {
    ...mapState({
      data: state => state.keywords.history,
      total: state => state.keywords.historyTotal,
    })
  },
  watch: {
    query: {
      handler(query) {
        this.$store.dispatch('keywords/updateHistory', query);
      },
      deep: true
    }
  },
  created() {
    this.$store.dispatch('keywords/updateHistory', this.query);
  }
}
</script>

<style lang="sass">
.History
  height: 100%
  width: 100%
  padding: 0 8px
  &-datatable>.row
    height: 46px
  &-table
    width: 100%
    word-break: break-all
  &-thName
    width: 60%
  &-thDate
    width: 20%
  &-thLinks
    width: 20%
</style>
