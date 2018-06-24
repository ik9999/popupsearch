<template>
  <div class="SearchResult">
    <a :href="result.href" v-html="getTitle()" @click.prevent="onClick($event, result.href)"></a>
    <div class="SearchResult-link" v-html="result.link"></div>
    <div class="SearchResult-desc" v-html="result.description"></div>
    <div class="SearchResult-subLinks">
      <template v-for="(linkData, linkIdx) in result.subLinkList">
        <a :href="linkData.href" class="SearchResult-subLink" @click.prevent="onClick($event, linkData.href)">
          {{ sublinkKeyList[linkIdx] ? '[' + sublinkKeyList[linkIdx] + ']' : '' }} {{ linkData.title }}
        </a>
        <span v-if="linkIdx < result.subLinkList.length - 1"> · </span>
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
    };
  },
  props: {
    result: {
      required: true,
    },
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
    }
  },
  mounted() {
    this.sublinkKeyList = _.fill(Array(this.result.subLinkList.length), undefined);
  }
}
</script>

<style lang="sass">
.SearchResult
  &-desc
    line-height: 1.35
    font-size: 0.9rem
    em
      font-weight: bold
      font-style: normal
    .date
      color: #808080
      font-size: 0.9rem
    a
      font-size: 0.8rem
  &-link
    padding-left: 1px
    color: #006621
    font-size: 0.8rem
    line-height: 1.1
  &-subLink
    font-size: 0.8rem
</style>
