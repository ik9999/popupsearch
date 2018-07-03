<template>
  <div class="SearchResult">
    <a
      :href="result.href" v-html="getTitle()" @click.prevent="onClick($event, result.href)"
      v-bind:class="{ 'SearchResult-title': true, 'SearchResult-title--opened': openedMainLink }"
    >
    </a>
    <div class="SearchResult-link" v-html="result.link"></div>
    <div class="SearchResult-desc" v-html="result.description"></div>
    <div class="SearchResult-subLinks" v-if="result.subLinkList.length > 0">
      <template v-for="(linkData, linkIdx) in result.subLinkList" v-if="sublinksType === 'links'">
        <a
          :href="linkData.href" @click.prevent="onClick($event, linkData.href)"
          v-bind:class="{
            'SearchResult-subLink': true, 'SearchResult-subLink--opened': openedSublinkIdx === linkIdx 
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
                  v-bind:class="{
                    'SearchResult-subLink': true, 'SearchResult-subLink--opened': openedSublinkIdx === linkIdx 
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
    triggerPressMainLink() {
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
  },
  mounted() {
    this.sublinkKeyList = _.fill(Array(this.result.subLinkList.length), undefined);
  }
}
</script>

<style lang="sass">
.SearchResult
  &-title, &-subLink
    background: none
    -webkit-transition: background-color 500ms linear;
    -ms-transition: background-color 500ms linear;
    transition: background-color 500ms linear;
  &-title--opened, &-subLink--opened
    background-color: #ffc7f7
    -webkit-transition: background-color 500ms linear;
    -ms-transition: background-color 500ms linear;
    transition: background-color 500ms linear;
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
  &-subLinkTable
    td, tr
      padding: 0
  &-subLink, &-subLinkDesc
    font-size: 0.8rem
</style>
