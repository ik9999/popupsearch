# PopupSearch

Chrome/Chromium extension with popup window for searching in google with

## Usage

- Assign shortcut for opening popup on [chrome://extensions/shortcuts](chrome://extensions/shortcuts) settings page (you should assign it because it doesnt work otherwise)

- Press your assigned shorcut to open popup

- Enter search query then press enter

- press number/letter displayed prior to the link in square brackets to open or click on the link with mouse.

You can change some shortcuts on extension settings page.

## Default shortcuts

Focus query input field or focus search results - **ctrl+e**

Clear input field - **ctrl+u**

Open result link in new active tab - press number/letter displayed prior to the link

Open result link in new background tab - press **shift** + number/letter displayed prior to the link

Open result link in current tab - press **Ctrl** + number/letter displayed prior to the link

Scrolling results - arrow keys, **j**/**k** keys, **PageUp**/**PageDown** keys 


## Demo

![gif demo](https://user-images.githubusercontent.com/6804575/41849425-8ee0126a-7889-11e8-9fb3-2c581d3350ff.gif)

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
