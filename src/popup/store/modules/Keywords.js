import _ from 'lodash';
import axios from 'axios';
import db from '../../helper/Database.js';
import SearchSyntax from '../../helper/SearchSyntax.js';

let isDdgSpecialKeyword = keyword => keyword[0] === '!' || keyword[0] === '=';

const state = {
  relatedOnlineKeywords: [],
  relatedOfflineKeywords: [],
  currentKeyword: undefined, //{name: string, id: number}
  lastNonRedirectKeywordId: undefined,
  oldestKeywordId: undefined,
  isDdgSpecialKeyword: false,
  error: undefined,
  history: [],
  historyTotal: 0,
  inputKeyword: undefined,
  curResSearchedMoreKeywords: [],
  historyQuery: {
    offset: 0,
    limit: 10,
    sort: 'timestamp',
    order: 'desc'
  }
};

const getters = {
  getRelatedKeywords(state) {
    let onlineKeywords = state.relatedOnlineKeywords;
    let offlineKeywords = state.relatedOfflineKeywords;
    onlineKeywords = _.map(onlineKeywords, (keyword) => {
      let visited = _.includes(offlineKeywords, keyword);
      if (visited) {
        offlineKeywords = _.without(offlineKeywords, keyword)
      }
      return {
        visited,
        keyword
      };
    });
    let offlineKeywordsRequired = (15 - state.relatedOnlineKeywords.length);
    offlineKeywords = _.reverse(_.slice(offlineKeywords, 0, offlineKeywordsRequired));
    return _.concat(onlineKeywords, _.map(offlineKeywords, (keyword) => {
      return {visited: true, keyword};
    }))
  }
};

const mutations = {
  setRelatedOnlineKeywords(state, keywords) {
    state.error = undefined;
    state.relatedOnlineKeywords = keywords;
  },
  setRelatedOfflineKeywords(state, keywords) {
    state.error = undefined;
    state.relatedOfflineKeywords = keywords;
  },
  setInputKeyword(state, keyword) {
    state.inputKeyword = keyword;
  },
  setCurrentKeyword(state, val) {
    state.currentKeyword = val;
    if (val && val.name) {
      state.isDdgSpecialKeyword = isDdgSpecialKeyword(val.name);
    }
  },
  setLastNonRedirectKeywordId(state, id) {
    state.lastNonRedirectKeywordId = id;
  },
  setOldestKeywordId(state, id) {
    state.oldestKeywordId = id;
  },
  setError(state, message) {
    state.error = message;
  },
  setHistory(state, list) {
    state.history = list;
  },
  setHistoryTotal(state, total) {
    state.historyTotal = total;
  },
  setQuery(state, val) {
    state.historyQuery = val;
  },
  setCurResSearchedMoreKeywords(state, val) {
    state.curResSearchedMoreKeywords = val;
  }
};


const actions = {
  async load({commit}) {
    window.port = chrome.extension.connect({
      name: "Sample Communication"
    });
    window.port.onMessage.addListener(function(msg) {
      if (_.isArray(msg)) {
        commit('setRelatedOfflineKeywords', msg);
      }
    });
    let openedKeywordId = _.parseInt(localStorage.getItem('openedKeywordId'));
    if (_.isFinite(openedKeywordId)) {
      let foundKeyword = await db.keywords.where({id: openedKeywordId}).limit(1).first();
      commit('setCurrentKeyword', foundKeyword);
    }
    let oldestKeyword = await db.keywords.limit(1).first();
    if (oldestKeyword) {
      commit('setOldestKeywordId', oldestKeyword.id);
    }
    let lastNonRedirectKeywordId = _.parseInt(localStorage.getItem('lastNonRedirectKeywordId'));
    if (_.isFinite(lastNonRedirectKeywordId)) {
      commit('setLastNonRedirectKeywordId', lastNonRedirectKeywordId);
    }
  },
  async updateCurrentKeyword({commit, state}, {keyword, forceNew}) {
    let foundKeyword = await db.keywords.where({name: keyword}).limit(1).first();
    let id;

    let keywordRemoved = false;
    let keywordAdded = false;
    if (foundKeyword) {
      id = foundKeyword.id;
      if (forceNew) {
        await db.keywords.where({id: foundKeyword.id}).delete();
        keywordRemoved = true;
      }
    }

    if (!foundKeyword || forceNew) {
      id = await db.keywords.add({
        name: keyword,
        timestamp: new Date().valueOf(),
      });
      localStorage.setItem('lastKeywordId', id);
      keywordAdded = true;
    }

    if (keywordRemoved) {
      window.port.postMessage({
        type: 'reload_keywords'
      });
    } else if (keywordAdded) {
      window.port.postMessage({
        type: 'add_keyword',
        data: {
          name: keyword,
          timestamp: new Date().valueOf(),
        }
      });
    }

    commit('setCurrentKeyword', {name: keyword, id});
    if (!state.isDdgSpecialKeyword) {
      if (!foundKeyword || forceNew) {
        localStorage.setItem('lastNonRedirectKeywordId', id);
        commit('setLastNonRedirectKeywordId', id);
      }
      localStorage.setItem('openedKeywordId', id);
    }
  },
  async updateSearchedMoreKeywords({commit, state}, {resultUrlList}) {
    let res = await Promise.all(_.map(_.without(resultUrlList, undefined), async(href) => {
      let moreKeyword = SearchSyntax.getMoreFromSite(href, state.currentKeyword.name);
      let foundKeyword = await db.keywords.where({name: moreKeyword}).limit(1).first();
      return [href, Boolean(foundKeyword)];
    }));
    commit('setCurResSearchedMoreKeywords', _(res).fromPairs().pickBy(v => v).keys().value());
  },
  async loadRelatedKeywords({rootState, commit, rootGetters}, keyword) {
    window.port.postMessage({
      type: 'get_related_keywords',
      keyword
    });
    commit('setInputKeyword', keyword)
    try {
      let keywordList = await (async() => {
        if (!_.isString(keyword) || _.isEmpty(keyword)) {
          return [];
        }
        let isBang = false;
        let bang = '';
        if (keyword[0] === '=') {
          return [];
        }
        if (keyword[0] === '!') {
          isBang = true;
          let keywSplit = keyword.split(' ');
          if (keywSplit.length < 2) {
            return [];
          }
          bang = keywSplit.shift();
          keyword = keywSplit.join(' ');
          if (_.isEmpty(keyword)) {
            return [];
          }
        }
        let response;
        let keywordList = [];
        switch (rootState.settings.settings.acSource) {
        case 'google':
          response = await axios.get('http://suggestqueries.google.com/complete/search?client=firefox', {
            params: {
              q: keyword
            }
          });
          let goKeywordList = _.get(response, 'data[1]');
          if (_.isArray(goKeywordList)) {
            keywordList = _.without(goKeywordList, keyword);
            if (isBang) {
              keywordList = _.map(keywordList, res => bang + ' ' + res);
            }
          }
          break;
        case 'searx':
          await _.reduce(rootGetters['settings/searxInstanceList'], async(pr, domain) => {
            await pr;
            if (response) {
              return;
            }
            try {
              response = await axios.get(`https://${domain}/autocompleter`, {
                params: {
                  q: keyword,
                  autocomplete: rootState.settings.settings.searxAutocompleteSource,
                }
              });
            } catch(e) {
              console.warn(e);
            }
          }, Promise.resolve());
          if (!response) {
            throw new Error('autocomplete error');
          }
          let searxKeywordList = _.get(response, 'data');
          if (_.isArray(searxKeywordList)) {
            keywordList = _.without(searxKeywordList, keyword);
            if (isBang) {
              keywordList = _.map(keywordList, res => bang + ' ' + res);
            }
          }
          break;
        }
        return keywordList;
      })();
      if (state.inputKeyword === keyword) {
        commit('setRelatedOnlineKeywords', _.without(keywordList, keyword));
      } else {
        commit('setRelatedOnlineKeywords', []);
      }
      return keywordList;
    } catch(error) {
      let msg;
      if (error.response) {
        msg = `Error - ${error.response.status}`;
      } else {
        msg = JSON.stringify(error.message);
      }
      commit('setError', msg);
      throw new Error(msg);
    }
  },
  async updateHistory({commit, state}, {limit, offset, order}) {
    if (state.historyTotal === 0) {
      commit('setHistoryTotal', await db.keywords.count());
    }
    let q = db.keywords.orderBy('id');
    if (order === 'desc') {
      q = q.reverse();
    }
    let list = await q.offset(offset).limit(limit).toArray();
    await Promise.all(_.map(list, (row) => {
      return db.visitedlinks.where({search_keyword: row.name}).count().then((count) => {
        row.links = count;
      })
    }));
    commit('setHistory', list);
  },
  async goPrev({dispatch, state}) {
    if (
      !state.oldestKeywordId || !state.currentKeyword || state.currentKeyword.id <= state.oldestKeywordId
    ) {
      return ;
    }
    let id = state.currentKeyword.id;
    let keyword;
    do {
      id -= 1;
      let foundKeyword = await db.keywords.where({id}).limit(1).first();
      keyword = undefined;
      if (foundKeyword) {
        keyword = foundKeyword.name;
      }
    } while (
      (_.isUndefined(keyword) || isDdgSpecialKeyword(keyword)) &&
      (id >= state.oldestKeywordId && id > 0)
    );
    if (keyword) {
      dispatch('searchresults/search', {keyword}, {root:true});
    }
  },
  async goNext({dispatch, state}) {
    if (
      !state.lastNonRedirectKeywordId || !state.currentKeyword ||
      state.currentKeyword.id >= state.lastNonRedirectKeywordId
    ) {
      return ;
    }
    let id = state.currentKeyword.id;
    let keyword;
    do {
      id += 1;
      let foundKeyword = await db.keywords.where({id}).limit(1).first();
      keyword = undefined;
      if (foundKeyword) {
        keyword = foundKeyword.name;
      }
    } while (
      (_.isUndefined(keyword) || isDdgSpecialKeyword(keyword)) &&
      (id <= state.lastNonRedirectKeywordId)
    );
    if (keyword) {
      dispatch('searchresults/search', {keyword}, {root:true});
    }
  },
  async goLast({dispatch, state}) {
    if (!state.lastNonRedirectKeywordId) {
      return ;
    }
    let foundKeyword = await db.keywords.where({
      id: state.lastNonRedirectKeywordId
    }).limit(1).first();
    if (foundKeyword) {
      dispatch('searchresults/search', {keyword: foundKeyword.name}, {root:true});
    }
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
