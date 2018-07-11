import layouts from 'convert-layout';
import _ from 'lodash';

export default {
  getMatchingKeys(key) {
    let keys = [key];
    if (_.isFinite(_.parseInt(key)) || String(key).length !== 1) {
      return keys;
    }
    _.each(layouts, (obj) => {
      let matchingKey = obj.fromEn(key);
      if (_.isString(matchingKey) && !_.isEmpty(matchingKey)) {
        keys.push(matchingKey);
      }
    });
    return _.uniq(keys);
  }
};
