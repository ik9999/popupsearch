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
      <label class="col-5 col-form-label">Remember search results/qeries, days</label>
      <div class="col-7">
        <input type="text" class="form-control" v-model="settings.lastDaysToRemember">
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
    <button type="submit" class="btn btn-primary" @click.prevent="save">Save</button>
  </form>
</template>

<script>
import Settings from '../popup/store/modules/Settings.js';

const state = Settings.state.settings;

export default {
  data() {
    return {
      engineList: ['googleHTML'],
      acSourceList: ['google'],
      modifierList: Settings.state.keyModifierList,
      settings: state
    }
  },
  methods: {
    save() {
      chrome.storage.local.set(this.settings, () => {
        alert('Saved');
      });
    }
  },
  mounted() {
    chrome.storage.local.get(state, (items) => {
      this.settings = items;
    });
  }
}
</script>

<style>
</style>
