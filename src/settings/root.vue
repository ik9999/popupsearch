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
    <h3>Shortcuts</h3>
    <div>Dont put spaces. Use '+' for combinations</div>
    <div class="form-group row mt-3" v-if="false">
      <label class="col-5 col-form-label">Toggle 'Close after opening a link'</label>
      <div class="col-7">
        <input type="text" class="form-control" v-model="settings.toggleClosepopupKey">
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
