<template>
  <form>
    <h3>Settings</h3>
    <div class="form-group row">
      <label class="col-5 col-form-label">Search engine</label>
      <div class="col-7">
        <select class="form-control" v-model="settings.searchEngine">
          <option v-for="option in engineList" v-bind:value="option">
            {{ option }}
          </option>
        </select>
      </div>
    </div>
    <div class="form-group row" v-if="settings.searchEngine === 'searx'">
      <label class="col-5 col-form-label">Searx.me language (i.e. 'en-US', 'de', default: 'all')</label>
      <div class="col-7">
        <input type="text" class="form-control" v-model="settings.searxLanguage">
      </div>
    </div>
    <div class="form-group row" v-if="settings.searchEngine === 'searx'">
      <label class="col-5 col-form-label">Searx.me <a href="https://searx.me/preferences#" target="_blank">search engines</a> (comma-separated)</label>
      <div class="col-7">
        <input type="text" class="form-control" v-model="settings.searxSearchEngines">
      </div>
    </div>
    <div class="form-group row">
      <label class="col-5 col-form-label">Autocomplete source</label>
      <div class="col-7">
        <select class="form-control" v-model="settings.acSource">
          <option v-for="option in acSourceList" v-bind:value="option">
            {{ option }}
          </option>
        </select>
      </div>
    </div>
    <div class="form-group row" v-if="settings.acSource === 'searx' || settings.searchEngine === 'searx'">
      <label class="col-5 col-form-label">Searx.me <a href="https://stats.searx.xyz/" target="_blank">instances</a> (comma-separated)</label>
      <div class="col-7">
        <input type="text" class="form-control" v-model="settings.searxInstances">
      </div>
    </div>
    <div class="form-group row" v-if="settings.acSource === 'searx'">
      <label class="col-5 col-form-label">Searx.me <a href="https://searx.me/preferences#" target="_blank">autocomplete source</a> (i.e. 'google', 'duckduckgo', etc.)</label>
      <div class="col-7">
        <input type="text" class="form-control" v-model="settings.searxAutocompleteSource">
      </div>
    </div>
    <div class="form-group row">
      <label class="col-5 col-form-label">Close popup after opening a link by default</label>
      <div class="col-7">
        <div class="form-check">
          <input
            class="form-check-input" type="checkbox" v-model="settings.closeAfterLink" style="margin-top: 12px"
          />
          <label class="form-check-label">
          </label>
        </div>
      </div>
    </div>
    <div class="form-group row">
      <label class="col-5 col-form-label">Remove highlighting (<code>#:~:text=...</code>) from links</label>
      <div class="col-7">
        <div class="form-check">
          <input
            class="form-check-input" type="checkbox" v-model="settings.removeHighlighting"
            style="margin-top: 12px"
          />
          <label class="form-check-label">
          </label>
        </div>
      </div>
    </div>
    <div class="form-group row">
      <label class="col-5 col-form-label">Keep search results/keyword history, days (0 to keep forever)</label>
      <div class="col-7">
        <input type="text" class="form-control" v-model="customSettings.keepHistoryDays">
      </div>
    </div>
    <h3>Shortcuts</h3>
    <div>Dont put spaces. Use '+' for combinations</div>
    <div class="form-group row mt-3">
      <label class="col-5 col-form-label">Jump to first loaded result</label>
      <div class="col-7">
        <input type="text" class="form-control" v-model="settings.jumpTopKey">
      </div>
    </div>
    <div class="form-group row mt-3">
      <label class="col-5 col-form-label">Jump to last loaded result</label>
      <div class="col-7">
        <input type="text" class="form-control" v-model="settings.jumpBottomKey">
      </div>
    </div>
    <div class="form-group row mt-3">
      <label class="col-5 col-form-label">Focus search field / Focus search results</label>
      <div class="col-7">
        <input type="text" class="form-control" v-model="settings.focusInputKey">
      </div>
    </div>
    <div class="form-group row mt-3">
      <label class="col-5 col-form-label">Focus search field / Focus search results (alternative)</label>
      <div class="col-7">
        <input type="text" class="form-control" v-model="settings.focusInputAltKey">
      </div>
    </div>
    <div class="form-group row mt-3">
      <label class="col-5 col-form-label">Clear input field</label>
      <div class="col-7">
        <input type="text" class="form-control" v-model="settings.clearInputKey">
      </div>
    </div>
    <div class="form-group row">
      <label class="col-5 col-form-label">Key modifier to open result link in new background tab</label>
      <div class="col-7">
        <select class="form-control" v-model="settings.openBgTabModifier">
          <option v-for="option in modifierList" v-bind:value="option">
            {{ option }}
          </option>
        </select>
      </div>
    </div>
    <div class="form-group row">
      <label class="col-5 col-form-label">Key modifier to open result link in new active tab</label>
      <div class="col-7">
        <select class="form-control" v-model="settings.openActTabModifier">
          <option v-for="option in modifierList" v-bind:value="option">
            {{ option }}
          </option>
        </select>
      </div>
    </div>
    <div class="form-group row">
      <label class="col-5 col-form-label">Key modifier to open result link in current tab</label>
      <div class="col-7">
        <select class="form-control" v-model="settings.openCurTabModifier">
          <option v-for="option in modifierList" v-bind:value="option">
            {{ option }}
          </option>
        </select>
      </div>
    </div>
    <div class="form-group row">
      <label class="col-5 col-form-label">Key modifier to show more results from the site</label>
      <div class="col-7">
        <select class="form-control" v-model="settings.showMoreModifier">
          <option v-for="option in modifierList" v-bind:value="option">
            {{ option }}
          </option>
        </select>
      </div>
    </div>
    <div class="form-group row mt-3">
      <label class="col-5 col-form-label">Scroll up</label>
      <div class="col-7">
        <input type="text" class="form-control" v-model="settings.scrollUpKey">
      </div>
    </div>
    <div class="form-group row mt-3">
      <label class="col-5 col-form-label">Scroll down</label>
      <div class="col-7">
        <input type="text" class="form-control" v-model="settings.scrollDownKey">
      </div>
    </div>
    <div class="form-group row mt-3">
      <label class="col-5 col-form-label">Open/Close history</label>
      <div class="col-7">
        <input type="text" class="form-control" v-model="settings.toggleHistoryKey">
      </div>
    </div>
    <div class="form-group row mt-3">
      <label class="col-5 col-form-label">Open previous keyword results</label>
      <div class="col-7">
        <input type="text" class="form-control" v-model="settings.openPrevResult">
      </div>
    </div>
    <div class="form-group row mt-3">
      <label class="col-5 col-form-label">Open next keyword results</label>
      <div class="col-7">
        <input type="text" class="form-control" v-model="settings.openNextResult">
      </div>
    </div>
    <div class="form-group row mt-3">
      <label class="col-5 col-form-label">Open last keyword results</label>
      <div class="col-7">
        <input type="text" class="form-control" v-model="settings.openLastResult">
      </div>
    </div>
    <div class="form-group row mt-3">
      <label class="col-5 col-form-label">Refresh results</label>
      <div class="col-7">
        <input type="text" class="form-control" v-model="settings.refreshResInputKey">
      </div>
    </div>
    <div class="mt-5 mb-4">
      <button type="submit" class="btn btn-primary" @click.prevent="save">Save</button>
      <button type="submit" class="btn btn-info" @click.prevent="reset">Reset settings</button>
    </div>
  </form>
</template>

<script>
import Settings from '../popup/store/modules/Settings.js';
import _ from 'lodash';

const defaultSettings = Settings.state.settings;
const defaultCustomSettings = {
  keepHistoryDays: 120
};

export default {
  data() {
    return {
      engineList: ['googleHTML', 'searx'],
      acSourceList: ['google', 'searx'],
      modifierList: Settings.state.keyModifierList,
      settings: _.cloneDeep(defaultSettings),
      customSettings: _.cloneDeep(defaultCustomSettings)
    }
  },
  methods: {
    save() {
      chrome.storage.local.set(this.settings, () => {
        chrome.storage.local.set(this.customSettings, () => {
          alert('Saved');
        });
      });
    },
    reset() {
      this.settings = _.cloneDeep(defaultSettings);
      this.customSettings = _.cloneDeep(defaultCustomSettings);
    }
  },
  created() {
    if (this.keepHistoryDays === null) {
      this.keepHistoryDays = 60;
    }
  },
  mounted() {
    chrome.storage.local.get(defaultSettings, (items) => {
      this.settings = items;
    });
    chrome.storage.local.get(this.customSettings, (items) => {
      this.customSettings = items;
    });
  }
}
</script>

<style>
</style>
