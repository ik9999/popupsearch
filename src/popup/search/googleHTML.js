import axios from 'axios';
import querystring from 'querystring-browser';
import fastFormat from 'fast-format';
import _ from 'lodash';

var linkSel = 'a[ping]'
var titleSel = 'h3'
var descSel = 'span.st'
var sublinksSel = 'div.osl a';
var itemSel = 'div.g'
var nextSel = 'td.b a span'

var googleUrl = '%s://www.google.%s/search?hl=%s&q=%s&start=%s&sa=N&num=%s&ie=UTF-8&oe=UTF-8&gws_rd=ssl'


export default async function(query, start) {
  if (_.isUndefined(start)) {
    start = 0;
  }
  let resultsPerPage = 15
  let tld = 'com'
  let lang = 'en'
  let protocol = 'https'

  let requestUrl = googleUrl;
  var newUrl = fastFormat(
    requestUrl, protocol, tld, lang, querystring.escape(query), start, resultsPerPage
  )

  let resp;
  try {
    resp = await axios.get(newUrl)
  } catch (error) {
    let msg;
    if (error.response) {
      msg = `Error - ${error.response.status}`;
    } else {
      msg = JSON.stringify(error.message);
    }
    let err = _.extend(new Error(msg), {url: newUrl});
    throw err;
  }

  let body = resp.data;
  let $body = $(body);
  let res = {
    url: newUrl,
    query: query,
    start: start,
    links: [],
    startNext: 0
  }

  let $input;
  $body.find('input').each(function() {
    if ($(this).val() === query) {
      $input = $(this);
    }
  });

  if (!$input) {
    return Promise.reject(_.extend(new Error('Parsing error'), {url: newUrl}));
  }

  $body.find(itemSel).each(function() {
    const $this = $(this);
    var titleElem = $this.find(titleSel);
    let linkElem = undefined;
    var item = {
      title: titleElem.first().text(),
      link: null,
      description: null,
      href: null,
      subLinkList: []
    }

    $this.find(linkSel).each(function() {
      let $link = $(this);
      if ($link.closest('.action-menu').length > 0 || $link.closest('.action-menu-panel').length > 0) {
        return;
      }
      linkElem = $link;

      var qsObj = querystring.parse(linkElem.attr('href'))

      if (qsObj['/url?q']) {
        item.href = qsObj['/url?q'];
      } else {
        item.href = linkElem.attr('href');
      }
      let hrefUrlObj;
      try {
        hrefUrlObj = new window.URL(item.href);
      } catch (e) {
        return;
      }
      if (hrefUrlObj.hostname === 'webcache.googleusercontent.com') {
        return;
      }
      if (hrefUrlObj.hostname === 'translate.google.com' && hrefUrlObj.pathname === '/translate') {
        return;
      }
      return false;
    });
    if (!linkElem) {
      console.warn("no link elem");
      return;
    }
    var descElem = $this.find(descSel);
    var sublinksInlineElem = $this.find(sublinksSel);

    var $date = descElem.find('span.f');
    if ($date.length > 0) {
      $date.addClass('date');
    }

    $this.find('cite').each(function() {
      item.link = $(this).text();
    });
    if (!item.link) {
      item.link = item.href;
    }

    if (sublinksInlineElem.length > 0) {
      sublinksInlineElem.each(function() {
        item.subLinkList.push({
          href: $(this).attr('href'),
          title: $(this).text(),
        });
      });
    } else if ($this.find('table').length > 0) {
      let $sublinksTable = $this.find('table');
      $sublinksTable.find('tr').last().remove();
      $sublinksTable.find('td').each(function() {
        let $a = $(this).find('a');
        if ($a.length === 0) {
          return ;
        }
        let linkText = $a.html();
        let linkHref = $a.attr('href');
        $a.remove();
        let linkDesc = $(this).text();
        item.subLinkList.push({
          href: linkHref,
          title: linkText,
          desc: (linkDesc ? linkDesc : ''),
        });
      });
    } else if ($this.find('a[href*="+site:"]').length > 0) {
      let $sublinksCont = $this.find('a[href*="+site:"]').parent().parent().parent();
      $sublinksCont.children().each(function() {
        if ($(this).find('a[href*="+site:"]').length > 0) {
          return ;
        }
        let $a = $(this).find('a');
        if ($a.length === 0) {
          return ;
        }
        let linkText = $a.html();
        let linkHref = $a.attr('href');
        $a.remove();
        let linkDesc = $(this).html().replace(/(<([^>]+)>)/ig, ' ').replace(/ +(?= )/g,'');
        item.subLinkList.push({
          href: linkHref,
          title: linkText,
          desc: (linkDesc ? linkDesc : ''),
        });
      });
    }
    descElem.find('a').each(function() {
      let $this = $(this);
      let sublinkData = {
        href: $this.attr('href'),
        title: $this.text()
      };
      if (!_.isUndefined(_.get(item.subLinkList, '[0].desc'))) {
        sublinkData.desc = "";
      }
      item.subLinkList.unshift(sublinkData);
      if ($this.parent().hasClass('f')) {
        $this.parent().remove();
      } else {
        $this.remove();
      }
    });
    item.description = descElem.html()

    if (item.href && item.title) {
      res.links.push(item)
    }
  })

  if ($body.find(nextSel).last().text() === 'Next') {
    res.startNext = start + res.links.length;
  }

  return res;
};
