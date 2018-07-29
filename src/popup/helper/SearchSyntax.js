export default {
  getMoreFromSite(url, keyword) {
    let hostname;
    if (url.indexOf("//") > -1) {
      hostname = url.split('/')[2];
    }
    else {
      hostname = url.split('/')[0];
    }

    hostname = hostname.split(':')[0];
    hostname = hostname.split('?')[0];
    if (!keyword) {
      return ;
    }
    return `${keyword} site:${hostname}`;
  }
};
