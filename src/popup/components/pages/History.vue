<template>
  <div class="History">
    <datatable class="History-datatable" :tbl-class="'History-table'"
      :columns="columns" :data="data" :total="total" :query="query" :HeaderSettings="false"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import _ from 'lodash';
import $ from 'jquery';
import Mousetrap from 'mousetrap';

export default {
  data() {
    return {
      HI: undefined,
      columns: [
        {
          title: 'Open',
          field: 'shortcut',
          thClass: 'History-tdShortcut',
          tdClass: 'History-tdShortcut',
        },
        {
          title: 'Keyword',
          field: 'name',
          thClass: 'History-tdName',
          tdClass: 'History-tdName',
        },
        {
          title: 'Date',
          field: 'timestamp',
          thClass: 'History-tdDate',
          tdClass: 'History-tdDate',
          sortable: true
        },
        {
          title: 'Opened links',
          field: 'links',
          thClass: 'History-tdLinks',
          tdClass: 'History-tdLinks',
        },
      ],
      query: undefined,
      data: []
    };
  },
  computed: {
    ...mapState({
      history: state => state.keywords.history,
      total: state => state.keywords.historyTotal,
      toggleHistoryKey: state => state.settings.settings.toggleHistoryKey,
    })
  },
  watch: {
    query: {
      handler(query) {
        this.$store.commit('keywords/setQuery', _.clone(query));
        this.$store.dispatch('keywords/updateHistory', query);
      },
      deep: true
    },
    history() {
      this.setHotkeys();
    }
  },
  created() {
    this.query = this.$store.state.keywords.historyQuery;
    this.$store.dispatch('keywords/updateHistory', this.query);
  },
  methods: {
    setHotkeys() {
      this.data = _.map(this.history, (obj, idx) => {
        let shortcut = idx + 1;
        if (shortcut === 10) {
          shortcut = 0;
        }
        return _.extend({}, obj, {shortcut: `[${shortcut}]`});
      });
    }
  },
  mounted() {
    let that = this;
    this.setHotkeys();
    $(this.$el).on('click', 'td', function() {
      let idx = $(this).closest('tr').index();
      that.$store.dispatch('searchresults/search', {keyword: that.data[idx].name});
      that.$store.commit('ui/setFocusedElement', 'searchresults', {root:true});
      that.$router.push('/');
    });
    this.HI = new Mousetrap();
    this.HI.stopCallback = (e) => {
      return false;
    };
    this.HI.bind(this.toggleHistoryKey.toLowerCase(), () => {
      this.$router.push('/');
      return false;
    });
  },
  beforeDestroy() {
    this.HI.reset();
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
    border-spacing: 0
    word-break: break-all
    height: calc(100% - 56px)
    thead, tbody, tr, td, th
      display: block
    tr:after
      content: ' '
      display: block
      visibility: hidden
      clear: both
    thead th
      height: 50px
    tbody
      height: 490px
      overflow-y: auto
      tr:first-child td
        border-top: none
      td
        cursor: pointer
    tbody td, thead th
      padding-left: 0.25rem
      padding-right: 0.25rem
      float: left
  &-tdName
    width: 60%
  &-tdDate
    width: 15%
  &-tdShortcut
    width: 10%
  &-tdLinks
    width: 15%
    text-align: center
</style>
