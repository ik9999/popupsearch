import axios from 'axios';
import querystring from 'querystring-browser';
import fastFormat from 'fast-format';
import _ from 'lodash';

const googleUrl = 'https://www.google.com/search?hl=%s&q=%s&start=%s&sa=N&num=%s&ie=UTF-8&oe=UTF-8&gws_rd=ssl'


export default async function(query, start) {
  if (_.isUndefined(start)) {
    start = 0;
  }
  let resultsPerPage = 15
  let lang = 'en';

  let requestUrl = googleUrl;
  let newUrl = fastFormat(
    requestUrl, lang, querystring.escape(query), start, resultsPerPage
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

  $body.find('div.g').each(function() {
    const $this = $(this);
    if ($this.parents('div.g').length > 0) {
      return;
    }
    let titleElem = $this.find('h3');
    let linkElem = undefined;
    let item = {
      title: titleElem.first().text(),
      link: null,
      description: null,
      href: null,
      subLinkList: []
    }

    $this.find('a[ping]').each(function() {
      let $link = $(this);
      if ($link.closest('.action-menu').length > 0 || $link.closest('.action-menu-panel').length > 0) {
        return;
      }
      linkElem = $link;

      let qsObj = querystring.parse(linkElem.attr('href'))

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
      console.warn('no link elem');
      return;
    }
    let $descElem = $this.find('span[class]:has(em)');
    if ($descElem.length === 0) {
      $descElem = $this.find('span[class]:last-of-type');
    }
    let sublinksInlineElem = $this.find('div.osl a');

    let $date = $descElem.find('span.f');
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
    if (($descElem.length === 0 || $descElem.text().trim().length === 0) && $this.find('div.g').length > 0) {
      //is featured snippet
      let $featuredSnippetDesc = $this.find('h2').parent().find('div.mod div[data-attrid="wa:/description"]');
      let $featuredSnippetDescSpanList = $featuredSnippetDesc.children('span');
      let $featuredSnippetDescSpan = $featuredSnippetDescSpanList.eq(0);
      if ($featuredSnippetDescSpanList.length === 2) {
        let dateText = $featuredSnippetDescSpanList.eq(1).text().trim();
        $featuredSnippetDescSpan.prepend(`<span class="f date">${dateText} - </span>`);
      }
      item.description = $featuredSnippetDescSpan.html();
    } else {
      $descElem.find('a').each(function() {
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
      item.description = $descElem.html()
    }
    //<span class="f date">Nov 19, 2011 - </span>

    if (item.href && item.title) {
      res.links.push(item)
    }
  })

  if ($body.find('td.b a span').last().text() === 'Next') {
    res.startNext = start + res.links.length;
  }

  return res;
};
