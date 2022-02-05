import axios from 'axios';
import _ from 'lodash';


export default async(urlTemplate, query, pageNum) => {
  const url = urlTemplate.replace('{q}', query).replace('{page}', pageNum);
  let response;
  try {
    response = await axios.get(url);
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
      _.each(linksList, ({link, title}) => {
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
        item.subLinkList.push({
          href: link,
          title,
          desc: ' ',
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

