<template>
  <div class="History">
    <datatable class="History-datatable" :tbl-class="'History-table'"
      :columns="columns" :data="data" :total="total" :query="query" :HeaderSettings="false"
      ref="datatable"
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
      keepFocusInterval: undefined,
      HI: undefined,
      columns: [
        {
          title: 'Shortcut',
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
          field: 'datetime',
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
    }),
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
      this.processData();
    }
  },
  created() {
    this.query = this.$store.state.keywords.historyQuery;
    this.$store.dispatch('keywords/updateHistory', this.query);
  },
  methods: {
    getShortcutByIdx(idx) {
      let shortcut = undefined;
      if (idx < 9) {
        shortcut = idx + 1;
      } else if (idx === 9) {
        shortcut = 0;
      } 
      return shortcut;
    },
    openByIdx(idx) {
      if (!this.data[idx]) {
        return ;
      }
      this.$store.dispatch('searchresults/search', {keyword: this.data[idx].name});
      this.$store.commit('ui/setFocusedElement', 'searchresults', {root:true});
      this.$router.push('/');
    },
    processData() {
      this.data = _.map(this.history, (obj, idx) => {
        let date = new Date(obj.timestamp);
        let dateStr = date.toLocaleDateString('UK');
        let shortcut = this.getShortcutByIdx(idx);
        return _.extend({}, obj, {
          shortcut: !_.isUndefined(shortcut) ? `[${shortcut}]` : '',
          datetime: `${dateStr} ${date.toLocaleTimeString()}`
        });
      });
    }
  },
  mounted() {
    let that = this;
    this.processData();
    $(this.$el).on('click', 'td', function() {
      let idx = $(this).closest('tr').index();
      that.openByIdx(idx);
    });
    this.HI = new Mousetrap();
    this.HI.stopCallback = (e) => {
      return false;
    };
    _.each(_.range(0, 10), (idx) => {
      let shortcut = this.getShortcutByIdx(idx);
      if (!shortcut) {
        return ;
      }
      this.HI.bind(String(shortcut), () => {
        that.openByIdx(idx);
      });
    });
    this.HI.bind('left', () => {
      this.$refs.datatable.$refs.pagination.turnPage(-1);
    });
    this.HI.bind('right', () => {
      this.$refs.datatable.$refs.pagination.turnPage(1);
    });
    this.HI.bind([this.toggleHistoryKey.toLowerCase(), 'esc'], () => {
      this.$router.push('/');
      return false;
    });
    let tableBodyEl = this.$el.querySelector('tbody');
    tableBodyEl.setAttribute('tabindex', '-1')
    if (tableBodyEl) {
      this.keepFocusInterval = setInterval(() => {
        tableBodyEl.focus();
      }, 400);
    }
  },
  beforeDestroy() {
    window.clearInterval(this.keepFocusInterval);
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
      border-top: none
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
    width: 48%
  &-tdDate
    width: 25%
    white-space: nowrap
  &-tdShortcut
    width: 12%
  &-tdLinks
    width: 15%
    text-align: center
</style>
