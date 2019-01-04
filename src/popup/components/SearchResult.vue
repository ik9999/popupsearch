<template>
  <div class="SearchResult">
    <div>
      <a
        :href="result.href" v-html="getTitle()" @click.prevent="onClick($event, result.href)"
        class="SearchResult-title"
        v-bind:class="{
          'SearchResult-title--opened': openedMainLink, 'SearchResult-title--visited': isLinkVisited(result.href),
          'SearchResult-title--visitedCur': isLinkVisitedFromCurKeyword(result.href)
        }"
      >
      </a>
      <sup
        v-if="result.subLinkList.length > 0" class="SearchResult-moreLink"
        :class="{'SearchResult-moreLink--visited': isMoreUsed}"
      >
        <a href="#" @click.prevent="openMoreFromSite(result.href)">more</a>
      </sup>
    </div>
    <div class="SearchResult-link" v-html="result.link"></div>
    <div class="SearchResult-desc" v-html="result.description"></div>
    <div class="SearchResult-subLinks" v-if="result.subLinkList.length > 0">
      <template v-for="(linkData, linkIdx) in result.subLinkList" v-if="sublinksType === 'links'">
        <a
          :href="linkData.href" @click.prevent="onClick($event, linkData.href)"
          class="SearchResult-title SearchResult-title--sub"
          v-bind:class="{
            'SearchResult-title--opened': openedSublinkIdx === linkIdx,
            'SearchResult-title--visited': isLinkVisited(linkData.href),
            'SearchResult-title--visitedCur': isLinkVisitedFromCurKeyword(linkData.href)
          }"
          v-html="(sublinkKeyList[linkIdx] ? '[' + sublinkKeyList[linkIdx] + ']' : '') + ' ' + linkData.title"
        >
        </a>
        <span v-if="linkIdx < result.subLinkList.length - 1"> · </span>
      </template>
      <template v-if="sublinksType === 'desc' || sublinksType === 'descdate'">
        <table class="table table-borderless SearchResult-subLinkTable">
          <tbody>
            <tr v-for="(linkData, linkIdx) in result.subLinkList">
              <td>
                <a
                  :href="linkData.href"
                  class="SearchResult-title SearchResult-title--sub"
                  v-bind:class="{
                    'SearchResult-title--opened': openedSublinkIdx === linkIdx,
                    'SearchResult-title--visited': isLinkVisited(linkData.href),
                    'SearchResult-title--visitedCur': isLinkVisitedFromCurKeyword(linkData.href)
                  }"
                  @click.prevent="onClick($event, linkData.href)"
                  v-html="(sublinkKeyList[linkIdx] ? '[' + sublinkKeyList[linkIdx] + ']' : '') + ' ' + linkData.title"
                >
                </a>
              </td>
              <td class="SearchResult-subLinkDesc">{{ linkData.desc }}</td>
            </tr>
          </tbody>
        </table>
      </template>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';

export default {
  data() {
    return {
      key: undefined,
      sublinkKeyList: [],
      openedMainLink: false,
      openedSublinkIdx: undefined
    };
  },
  props: {
    result: {
      required: true,
    },
  },
  computed: {
    sublinksType() {
      if (this.result.subLinkList.length === 0) {
        return undefined;
      }
      if (!_.isUndefined(this.result.subLinkList[0].desc)) {
        return 'desc';
      } else {
        return 'links';
      }
    },
    isMoreUsed() {
      return _.includes(this.$store.state.keywords.curResSearchedMoreKeywords, this.result.href);
    }
  },
  methods: {
    onClick(event, url) {
      let keyModifier = '';
      if (event.altKey) {
        keyModifier = 'Alt';
      } else if (event.ctrlKey) {
        keyModifier = 'Ctrl';
      } else if (event.shiftKey) {
        keyModifier = 'Shift';
      }
      this.$store.dispatch('links/openLink', {url, keyModifier});
    },
    getTitle() {
      if (_.isUndefined(this.key)) {
        return this.result.title;
      }
      return `[${this.key}] ${this.result.title}`;
    },
    getHieght() {
      return this.$el.offsetHeight;
    },
    setKey(key) {
      if (!_.isUndefined(key)) {
        key = String(key);
      }
      this.key = key;
    },
    setSublinkKey(key, linkIdx) {
      if (!_.isUndefined(key)) {
        key = String(key);
      }
      if (_.isUndefined(linkIdx)) {
        this.sublinkKeyList = _.fill(Array(this.result.subLinkList.length), key);
      } else {
        this.sublinkKeyList[linkIdx] = key;
      }
    },
    triggerPressMainLink(keyModifierType) {
      if (keyModifierType === 'showMoreModifier') {
        return ;
      }
      this.openedMainLink = true;
      setTimeout(() => {
        this.openedMainLink = false;
      }, 500);
    },
    triggerPressSubLink(idx) {
      this.openedSublinkIdx = idx;
      setTimeout(() => {
        this.openedSublinkIdx = undefined;
      }, 500);
    },
    isLinkVisited(href) {
      return !_.isUndefined(_.get(this.$store.state.searchresults.curSearchVisitedLinks[href], 'id'));
    },
    isLinkVisitedFromCurKeyword(href) {
      return (
        !_.isUndefined(_.get(this.$store.state.searchresults.curSearchVisitedLinks[href], 'id')) &&
        this.$store.state.searchresults.curSearchVisitedLinks[href]['search_keyword'] ===
        this.$store.state.keywords.currentKeyword.name
      );
    },
    openMoreFromSite(href) {
      this.$store.dispatch('links/openLink', {url: href, keyModifierType: 'showMoreModifier'});
    }
  },
  mounted() {
    this.sublinkKeyList = _.fill(Array(this.result.subLinkList.length), undefined);
  }
}
</script>

<style lang="sass">
.SearchResult
  &-title
    background: none
    -webkit-transition: background-color 500ms linear;
    -ms-transition: background-color 500ms linear;
    transition: background-color 500ms linear;
    &--opened
      background-color: #ffc7f7
      -webkit-transition: background-color 500ms linear;
      -ms-transition: background-color 500ms linear;
      transition: background-color 500ms linear;
    &--sub
      font-size: 0.8rem
    &--visited, &--visited:hover
      color: #754e88
    &--visitedCur
      color: #609
  &-desc
    line-height: 1.35
    font-size: 0.9rem
    em
      font-weight: bold
      font-style: normal
    .date
      color: #808080
      font-size: 0.9rem
  &-subLinks
    font-size: 0.8rem
  &-link
    padding-left: 1px
    color: #006621
    font-size: 0.8rem
    line-height: 1.1
  &-subLinkTable
    td, tr
      padding: 0
  &-moreLink
    font-size: 60%
    top: -0.68em
    &--visited, &--visited a
      color: #609
</style>
