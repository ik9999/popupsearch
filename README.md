<p align="center">
  <a href="https://github.com/ik9999/popupsearch" target="_blank" rel="noopener noreferrer">
    <img src="https://raw.githubusercontent.com/ik9999/popupsearch/master/src/icons/promo_440_280.png" alt="logo">
  </a>
</p>

<p align="center">
  Chrome/Chromium extension for searching in google™ or searx.me and browsing results using popup window. The main idea is to not keep opened tabs with search results but do all the searching, results browsing in popup window. 
</p>
<hr />

## Features

- Full keyboard navigation

- Custom shortcuts

- Displaying additional links (e.g. More from this site)

- Search results caching

- Visited links highlighting

- [DuckDuckGo bangs](https://duckduckgo.com/bang) (type something like "!yt test" then press Enter or Ctrl/Shift/Alt + Enter to search on youtube)

- [DuckDuckGo calculator](https://duckduckgo.com/?q=%3D2%2B2&t=h_&ia=calculator) (type your expression e.g. "=2+2" then press Enter or Ctrl/Shift/Alt + Enter to open ddg calculator page)

- Internal search keywords search/history

- Searx.me or google.com as search engine/keywords source (google.com is a default one for both, you can switch it in settings).

- Customizable via settings UI

## Screenshot

![screenshot](https://user-images.githubusercontent.com/6804575/47818042-388e7e80-dd68-11e8-9453-db1e71cd85cb.png)

<a href="https://user-images.githubusercontent.com/6804575/47867572-f110fc80-de12-11e8-83ae-0b844319f43e.gif" target="_blank" rel="noopener noreferrer">gif demo</a>

## Installation

### From zip

- Download latest zip from [Releases page](https://github.com/ik9999/popupsearch/releases)

- Unpack it to some directory

- Go to __chrome://extensions/__ page

- Enable Developer mode

- Click "Load unpacked" button and open the directory you unpacked downloaded zip to.

- Re-assign shortcut to open popup on __chrome://extensions/shortcuts__ page

### From crx

- Download latest crx from [Releases page](https://github.com/ik9999/popupsearch/releases)

- Go to 	__chrome://extensions/__ page

- Enable Developer mode

- Drag crx file from downloads bar to Extensions page

- Re-assign shortcut to open popup on 	__chrome://extensions/shortcuts__ page

## Troubleshooting

If one installation method doesnt work for you - you can try another. If both methods dont work, you can google solutions (Google Chrome makes it harder to use non-webstore plugins with every version) or use [Chromium Browser](https://www.google.com/search?q=download+chromium) / [ungoogled-chromium](https://ungoogled-software.github.io/ungoogled-chromium-binaries/).

You can report bugs by creating [the issue](https://github.com/ik9999/popupsearch/issues) or by email: q@eqw.me

## Usage

- Assign shortcut for opening popup on [chrome://extensions/shortcuts](chrome://extensions/shortcuts) settings page (you should assign it because it doesnt work otherwise)

- Press your assigned shorcut to open popup

- Enter search query then press enter

- press number/letter displayed prior to the link in square brackets to open or click on the link with mouse.

You can change some shortcuts on extension settings page.


## Default shortcuts

Focus query input field or focus search results - **ctrl+e** / **tab**

Clear input field - **ctrl+u**

Jump to first loaded result - **g g**

Jump to last loaded result - **shift+g**

Clear input field - **ctrl+u**

Open result link in new active tab - press number/letter displayed prior to the link

Open result link in new background tab - press **shift** + number/letter displayed prior to the link

Open result link in current tab - press **Ctrl** + number/letter displayed prior to the link

Show more from this site - press **Alt** + number/letter displayed prior to the link

Scrolling results - arrow keys, **j**/**k** keys, **PageUp**/**PageDown** keys 

Open previous keyword results - **left**

Open next keyword results - **right**

Open last keyword results - **Ctrl+right**

### History page

Open previous page - **left**

Open next page - **right**

## Future improvements

- Dark color ui theme

- Visited links history

## Development

```bash
$ npm install
$ npm run build
```

### `npm run build` 

Build the extension into `dist` folder for **production**.

### `npm run build:dev` 

Build the extension into `dist` folder for **development**.

### `npm run watch`

Watch for modifications then run `npm run build`.

### `npm run watch:dev`

Watch for modifications then run `npm run build:dev`.

It also enable [Hot Module Reloading](https://webpack.js.org/concepts/hot-module-replacement), thanks to [webpack-chrome-extension-reloader](https://github.com/rubenspgcavalcante/webpack-chrome-extension-reloader) plugin. 

:warning: Keep in mind that HMR only works for your **background** entry.

### `npm run build-zip`

Build a zip file following this format `<name>-v<version>.zip`, by reading `name` and `version` from `manifest.json` file.
Zip file is located in `dist-zip` folder.

## Libraries used for UI

[Vue.js](https://github.com/vuejs/vue)

[Vuex](https://github.com/vuejs/vuex)

[jquery-autocomplete](https://github.com/xdan/autocomplete)

[other dependencies](https://github.com/ik9999/popupsearch/blob/master/package.json)
