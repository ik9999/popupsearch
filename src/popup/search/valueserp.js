import axios from 'axios';
import _ from 'lodash';


export default async(urlTemplate, query, pageNum, simultaneousReqs) => {
  const url = urlTemplate.replace('{q}', query).replace('{page}', pageNum);
  let httpReqs = _.map(_.range(1, _.parseInt(simultaneousReqs) + 1), () => {
    return axios.get(url);
  });
  let response;
  try {
    response = await Promise.race(httpReqs);
  } catch (e) {
    let message = 'No response';
    if (_.get(e, 'response.data.request_info.message')) {
      message = _.get(e, 'response.data.request_info.message');
    }
    const err = new Error(message);
    err.url = url;
    throw err;
  }
  if (!response.data) {
    const err = new Error('Invalid response');
    err.url = url;
    throw err;
  }
  if (!response.data['organic_results']) {
    const err = new Error('Invalid response');
    err.url = url;
    throw err;
  }
  let links = [];
  _.each(response.data['organic_results'], (resultData) => {
    let item = {
      link: resultData['displayed_link'],
      description: resultData['snippet'],
      href: resultData['link'],
      title: resultData['title'],
      subLinkList: []
    }
    _.each(resultData['sitelinks'], (linksList) => {
      _.each(linksList, (subLinkData) => {
        let {link, title} = subLinkData;
        if (_.startsWith(link, '/')) {
          return;
        }
        let hrefUrlObj;
        try {
          hrefUrlObj = new window.URL(link);
        } catch (e) {
          console.log(link);
          console.warn(e);
          return;
        }
        if (hrefUrlObj.hostname === 'webcache.googleusercontent.com') {
          return;
        }
        if (hrefUrlObj.hostname === 'translate.google.com' && hrefUrlObj.pathname === '/translate') {
          return;
        }
        let description = ' ';
        if (subLinkData['answers_raw']) {
          description += subLinkData['answers_raw'] + ' ';
        }
        if (subLinkData['date_raw']) {
          description += subLinkData['date_raw'] + ' ';
        }
        item.subLinkList.push({
          href: link,
          title,
          desc: description,
        })
      });
    });
    links.push(item);
    _.each(resultData['nested_results'], (nestedResultData) => {
      links.push({
        link: nestedResultData['displayed_link'],
        title: nestedResultData['title'],
        href: nestedResultData['link'],
        description: resultData['snippet'],
        subLinkList: [],
      });
    });
  });

  return {
    url,
    query,
    pageNum,
    links
  }
};

