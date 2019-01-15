import axios from 'axios';
import _ from 'lodash';

export default async(instanceDomain, language, query, pageNum, searchEngines) => {
  const url = `https://${instanceDomain}/?q=${query}&language=${language}&format=json&engines=${searchEngines}` +
    `&pageno=${pageNum}`;
  let response = await axios.get(url);

  let resultList = _.get(response, 'data.results');
  if (!_.isArray(resultList)) {
    const err = new Error(`Invalid response from ${instanceDomain}`);
    err.url = url;
    throw err;
  }
  if (_.get(response, 'data.unresponsive_engines[0]')) {
    const err = new Error(`Invalid response from ${instanceDomain}: ` +
      _.get(response, 'data.unresponsive_engines[0]').join(' '));
    err.url = url;
    throw err;
  }
  const links = _.map(resultList, (resultData) => {
    return {
      title: resultData.title,
      link: resultData.pretty_url,
      description: resultData.content,
      href: resultData.url,
      subLinkList: []
    };
  });

  return {
    url,
    query,
    pageNum,
    links
  }
};
