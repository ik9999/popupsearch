import _ from 'lodash';
import axios from 'axios';
import db from '../../helper/Database.js';

const state = {
  historyKeywords: [],
  remoteKeywords: [],
  currentKeyword: '',
  isDdgSpecialKeyword: false,
  error: undefined
};

const getters = {
};

const mutations = {
  setRemoteKeywords(state, keywords) {
    state.error = undefined;
    state.remoteKeywords = keywords;
  },
  setCurrentKeyword(state, keyword) {
    state.currentKeyword = keyword;
    state.historyKeywords.push(keyword);
    state.isDdgSpecialKeyword = (keyword[0] === '!' || keyword[0] === '=');
  },
  setError(state, message) {
    state.error = message;
  }
};

const actions = {
  async load({commit, state}) {
    let openedKeywordId = _.parseInt(localStorage.getItem('openedKeywordId'));
    if (_.isFinite(openedKeywordId)) {
      let foundKeyword = await db.keywords.where({id: openedKeywordId}).limit(1).first();
      commit('setCurrentKeyword', foundKeyword.name);
    }
  },
  async updateCurrentKeyword({commit, state}, keyword) {
    commit('setCurrentKeyword', keyword);
    let foundKeyword = await db.keywords.where({name: keyword}).limit(1).first();
    if (!foundKeyword) {
      foundKeyword = {
        id: await db.keywords.add({
          name: keyword,
          timestamp: new Date().valueOf(),
        })
      };
      localStorage.setItem('lastKeywordId', foundKeyword.id);
    }
    localStorage.setItem('openedKeywordId', foundKeyword.id);
  },
  loadRemoteKeys({rootState, commit, state}, keyword) {
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
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
