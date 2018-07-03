import axios from 'axios';
import querystring from 'querystring-browser';
import fastFormat from 'fast-format';
import _ from 'lodash';

var linkSel = 'h3.r a'
var descSel = 'span.st'
var sublinksSel = 'div.osl a';
var itemSel = 'div.g'
var nextSel = 'td.b a span'

var URL = '%s://www.google.%s/search?hl=%s&q=%s&start=%s&sa=N&num=%s&ie=UTF-8&oe=UTF-8&gws_rd=ssl'

var nextTextErrorMsg = 'Translate `google.nextText` option to selected language to detect next results link.'
var protocolErrorMsg = "Protocol `google.protocol` needs to be set to either 'http' or 'https', please use a valid protocol. Setting the protocol to 'https'."

// start parameter is optional
let google = (query, start) => {
  var startIndex = 0
  if (start) {
    startIndex = start
  }
  return igoogle(query.trim(), startIndex);
}

google.resultsPerPage = 15
google.tld = 'com'
google.lang = 'en'
google.nextText = 'Next'
google.protocol = 'https'

var igoogle = function (query, start) {
  if (google.resultsPerPage > 100) google.resultsPerPage = 100 // Google won't allow greater than 100 anyway
  if (google.lang !== 'en' && google.nextText === 'Next') console.warn(nextTextErrorMsg)
  if (google.protocol !== 'http' && google.protocol !== 'https') {
    google.protocol = 'https'
    return Promise.reject(_.extend(new Error('Protocol error'), {url: newUrl}));
  }

  // timeframe is optional. splice in if set
  if (google.timeSpan) {
    URL = URL.indexOf('tbs=qdr:') >= 0 ? URL.replace(/tbs=qdr:[snhdwmy]\d*/, 'tbs=qdr:' + google.timeSpan) : URL.concat('&tbs=qdr:', google.timeSpan)
  }
  var newUrl = fastFormat(URL, google.protocol, google.tld, google.lang, querystring.escape(query), start, google.resultsPerPage)

  return axios.get(newUrl).then((resp) => {
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
      var linkElem = $this.find(linkSel);
      var descElem = $this.find(descSel);
      var sublinksInlineElem = $this.find(sublinksSel);
      var item = {
        title: linkElem.first().text(),
        link: null,
        description: null,
        href: null,
        subLinkList: []
      }
      var qsObj = querystring.parse(linkElem.attr('href'))

      if (qsObj['/url?q']) {
        item.href = qsObj['/url?q'];
      } else {
        item.href = linkElem.attr('href');
      }
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

    if ($body.find(nextSel).last().text() === google.nextText) {
      res.startNext = start + res.links.length;
    }

    return Promise.resolve(res);
  }, (error) => {
    let msg;
    if (error.response) {
      msg = `Error - ${error.response.status}`;
    } else {
      msg = JSON.stringify(error.message);
    }
    return Promise.reject(_.extend(new Error(msg), {url: newUrl}));
  });
}

export default google;
