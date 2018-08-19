import Fuse from 'fuse.js';
import db from './popup/helper/Database';
import _ from 'lodash';

(async () => {
  let allKeywords = await db.keywords.toArray();

  let fuse = new Fuse(allKeywords, {
    shouldSort: true,
    tokenize: true,
    includeScore: true,
    threshold: 0.4,
    location: 0,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
      "name",
    ]
  });

  self.onmessage = async function(event) {
    event = event.data;
    if (!event) {
      return ;
    }
    if (event.type === 'get_related_keywords') {
      await fuse.cancel();
      try {
        let keyword = _.trimStart(event.keyword);
        if (!_.isString(keyword) || keyword.length === 0) {
          self.postMessage(_.map(_.slice(allKeywords, -15), 'name'));
          return
        }
        let res = await fuse.search(keyword);
        let goodScoreResultList = [];
        let maxTime = 0;
        let minTime = Number.MAX_SAFE_INTEGER;
        _.each(res, (val) => {
          if (val.score < 0.5) {
            if (val.item.timestamp > maxTime) {
              maxTime = val.item.timestamp;
            }
            if (val.item.timestamp < minTime) {
              minTime = val.item.timestamp;
            }
            goodScoreResultList.push({
              similarityScore: 1 - val.score/0.6,
              name: val.item.name,
              timestamp: val.item.timestamp
            });
          } else {
            return false;
          }
        });
        if (maxTime > 0) {
          _.each(goodScoreResultList, (val) => {
            val.timeScore = (val.timestamp - minTime) / (maxTime - minTime);
            val.score = (val.timeScore + val.similarityScore) / 2;
          });
        }
        console.log(goodScoreResultList);
        goodScoreResultList = _.reverse(_.sortBy(goodScoreResultList, 'score'));
        self.postMessage(_(goodScoreResultList).slice(0, 15).map('name').without(keyword).value());
      } catch(e) {
      }
    }
    if (event.type === 'add_keyword') {
      allKeywords.push(event.data);
    }
    if (event.type === 'reload_keywords') {
      allKeywords = await db.keywords.toArray();
      fuse.list = allKeywords;
    }
  };
})();

