import _ from 'lodash';
import axios from 'axios';
import db from '../../helper/Database.js';

let isDdgSpecialKeyword = keyword => keyword[0] === '!' || keyword[0] === '=';

const state = {
  lastKeywords: [],
  remoteKeywords: [],
  currentKeyword: undefined, //{name: string, id: number}
  lastNonRedirectKeywordId: undefined,
  oldestKeywordId: undefined,
  isDdgSpecialKeyword: false,
  error: undefined,
  history: [],
  historyTotal: 0,
  historyQuery: {
    offset: 0,
    limit: 10,
    sort: 'timestamp',
    order: 'desc'
  }
};

const getters = {
};

const mutations = {
  setRemoteKeywords(state, keywords) {
    state.error = undefined;
    state.remoteKeywords = keywords;
  },
  setCurrentKeyword(state, val) {
    state.currentKeyword = val;
    if (val.name) {
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
  }
};

const actions = {
  async load({commit}) {
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

    if (foundKeyword) {
      id = foundKeyword.id;
      if (forceNew) {
        await db.keywords.where({id: foundKeyword.id}).delete();
      }
    }

    if (!foundKeyword || forceNew) {
      id = await db.keywords.add({
        name: keyword,
        timestamp: new Date().valueOf(),
      });
      localStorage.setItem('lastKeywordId', id);
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
  loadRemoteKeys({rootState, commit}, keyword) {
    return (new Promise((resolveFn) => {
      if (!_.isString(keyword) || _.isEmpty(keyword)) {
        return resolveFn([]);
      }
      let isBang = false;
      let bang = '';
      if (keyword[0] === '=') {
        return resolveFn([]);
      }
      if (keyword[0] === '!') {
        isBang = true;
        let keywSplit = keyword.split(' ');
        if (keywSplit.length < 2) {
          return resolveFn([]);
        }
        bang = keywSplit.shift();
        keyword = keywSplit.join(' ');
        if (_.isEmpty(keyword)) {
          return resolveFn([]);
        }
      }
      switch (rootState.settings.settings.acSource) {
      case 'google':
        return resolveFn(axios.get('http://suggestqueries.google.com/complete/search?client=firefox', {
          params: {
            q: keyword
          }
        }).then((response) => {
          let keywordList = _.get(response, 'data[1]');
          if (_.isArray(keywordList)) {
            keywordList = _.without(keywordList, keyword);
            if (isBang) {
              return Promise.resolve(_.map(keywordList, res => bang + ' ' + res));
            }
            return Promise.resolve(keywordList);
          }
          return Promise.resolve([]);
        }));
        break;
      }
      return resolveFn([]);
    })).then((keywordList) => {
      commit('setRemoteKeywords', _.without(keywordList, keyword));
      return Promise.resolve(keywordList);
    }, error => {
      let msg;
      if (error.response) {
        msg = `Error - ${error.response.status}`;
      } else {
        msg = JSON.stringify(error.message);
      }
      commit('setError', msg);
      return Promise.reject(new Error(msg));
    });
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
    } while (keyword && isDdgSpecialKeyword(keyword) && id >= state.oldestKeywordId);
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
    } while (keyword && isDdgSpecialKeyword(keyword) && id <= state.lastNonRedirectKeywordId);
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
