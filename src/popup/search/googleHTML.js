import axios from 'axios';
import querystring from 'querystring-browser';
import fastFormat from 'fast-format';
import _ from 'lodash';

const googleUrl = 'https://www.google.com/search?hl=%s&q=%s&start=%s&sa=N&num=%s&ie=UTF-8&oe=UTF-8&gws_rd=ssl'

let removeUnwantedTags = ($rootEl) => {
  $rootEl.find('*').filter(function() {
    if (_.includes(['img', 'g-img', 'svg'], $(this).prop('tagName').toLowerCase())) {
      return true;
    }
    return $.trim($(this).text()).length === 0;
  }).remove();
};

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

  $body.find('div.g').each(function(resultIdx) {
    const $this = $(this);
    console.log($this.html());
    if ($this.parents('div.g').length > 0) {
      return;
    }
    let linkElem = undefined;
    let item = {
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
      console.warn('no link elem', resultIdx);
      return;
    }
    let validateTextContainer = (domEl) => {
      if (!domEl) {
        return false;
      }
      let result = false;
      _.each(domEl.childNodes, (node) => {
        if (node.nodeName === '#text') {
          result = true;
          return false;
        }
      });
      return result;
    };
    let $descElem = undefined;
    $this.find('div > div > span').each(function() {
      if ($(this)[0].classList.length === 0) {
        let $parent = $(this).parent();
        if ($parent[0].classList.length >= 4) {
          let $grparent = $parent.parent();
          if ($grparent[0].classList.length === 1 && validateTextContainer($(this)[0])) {
            $descElem = $(this);
            let $siblingsList = $(this).siblings();
            if ($siblingsList.length > 0 && $siblingsList[0].tagName === 'SPAN') {
              let searchDate = $siblingsList[0];
              if (searchDate.childNodes.length === 1 && searchDate.childNodes[0].nodeName === '#text') {
                $descElem.prepend($(searchDate).addClass('date'));
              }
            }
            return false;
          }
        }
      }
    });
    if (!$descElem) {
      $this.find('div > div').each(function() {
        if ($(this)[0].classList.length >= 4) {
          let $parent = $(this).parent();
          console.log($parent[0].classList.length, validateTextContainer($(this)[0]));
          if ($parent[0].classList.length === 1 && validateTextContainer($(this)[0])) {
            $descElem = $(this);
            return false;
          }
        }
      });
    }
    if (!$descElem || $descElem.length === 0) {
      $descElem = $this.find('span:last-of-type');
    }
    let $sublinksInlineElem = undefined;
    
    if (item.href) {
      let itemHrefHost;
      try {
        itemHrefHost = _.trimStart((new URL(item.href)).host, 'www.');
      } catch (e) {
      }
      if (itemHrefHost) {
        $this.find('div').each(function() {
          let isValid = true;
          _.each($(this)[0].childNodes, (childNodeDomEl) => {
            if (childNodeDomEl.nodeName !== '#text' && childNodeDomEl.nodeName !== 'A') {
              isValid = false;
              return false;
            }
            if (childNodeDomEl.nodeName === 'A') {
              let hostname = undefined;
              try {
                hostname = _.trimStart((new URL(childNodeDomEl.href)).host, 'www.');
              } catch (e) {
              }
              if (hostname && hostname !== itemHrefHost) {
                isValid = false;
                return false;
              }
            }
          });
          if ($(this)[0].childNodes.length > 0 && isValid) {
            $sublinksInlineElem = $(this);
          }
        });
      }
    }

    $this.find('cite').each(function() {
      item.link = $(this).text();
    });
    if (!item.link) {
      item.link = item.href;
    }

    if ($sublinksInlineElem) {
      $sublinksInlineElem.find('a').each(function() {
        removeUnwantedTags($(this));
        item.subLinkList.push({
          href: $(this).attr('href'),
          title: _.trim($(this).text()),
        });
        $(this).remove();
      });
    } else if ($this.find('table').length > 0) {
      let $sublinksTable = $this.find('table');
      $sublinksTable.find('tr').last().remove();
      $sublinksTable.find('td').each(function() {
        removeUnwantedTags($(this));
        let $a = $(this).find('a');
        if ($a.length === 0) {
          return ;
        }
        $a.children().each(function() {
          if ($(this).prop('tagName').toLowerCase() === 'div') {
            $(this).replaceWithTag('span');
          }
        })
        let linkText = $a.html();
        let linkHref = $a.attr('href');
        $a.remove();
        let linkDesc = $(this).text();
        item.subLinkList.push({
          href: linkHref,
          title: _.trim(linkText),
          desc: (linkDesc ? _.trim(linkDesc) : ''),
        });
        $(this).remove();
      });
    } else if ($this.find('a[href*="+site:"]').length > 0) {
      let $sublinksCont = $this.find('a[href*="+site:"]').parent().parent().parent().parent();
      $sublinksCont.children().each(function() {
        if ($(this).find('a[href*="+site:"]').length > 0) {
          return ;
        }
        removeUnwantedTags($(this));
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
          title: _.trim(linkText),
          desc: (linkDesc ? _.trim(linkDesc) : ''),
        });
        $(this).remove();
      });
    }
    if (($descElem.length === 0 || $descElem.text().trim().length === 0) && $this.find('div.g').length > 0) {
      console.log('is featured snippet', resultIdx);
      //is featured snippet
      let $featuredSnippetDesc = $this.find('h2').parent().find('div.mod div[data-attrid="wa:/description"]');
      let $featuredSnippetDescSpanList = $featuredSnippetDesc.children('span');
      let $featuredSnippetDescSpan = $featuredSnippetDescSpanList.eq(0);
      if ($featuredSnippetDescSpanList.length === 2) {
        let dateText = $featuredSnippetDescSpanList.eq(1).text().trim();
        $featuredSnippetDescSpan.prepend(`<span class="f date">${dateText} - </span>`);
      }
      removeUnwantedTags($featuredSnippetDescSpan)
      item.description = $featuredSnippetDescSpan.html();
    } else if ($descElem.length !== 0) {
      $descElem.find('a').each(function() {
        let $this = $(this);
        let sublinkData = {
          href: $this.attr('href'),
          title: _.trim($this.text())
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
      removeUnwantedTags($descElem);
      item.description = $descElem.html()
    }
    let $title = $this.find('h3').last();
    item.title = _.trim($title.first().text());
    if (
      $descElem.length === 0 && _.isNull(item.description) && $this.find('div.rc').length > 0 &&
      $this.find('div.rc').eq(0).find('span').length > 0
    ) {
      try {
        $this.find('div.rc').eq(0).find('a[ping]').eq(0).parent().remove();
      } catch (e) {
        console.warn(e);
      }
      let $descElem = $this.find('div.rc').eq(0).find('span').eq(0);
      removeUnwantedTags($descElem);
      item.description = $descElem.html();
    }

    if (item.href && item.title) {
      res.links.push(item)
    }
  })

  if ($body.find('td.b a span').last().text() === 'Next') {
    res.startNext = start + res.links.length;
  }

  return res;
};
