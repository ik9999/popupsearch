<template>
  <form>
    <div class="form-group row">
      <label class="col-2 col-form-label">Search engine</label>
      <div class="col-10">
        <select class="form-control" v-model="settings.searchEngine">
          <option v-for="option in engineList" v-bind:value="option">
            {{ option }}
          </option>
        </select>
      </div>
    </div>
    <div class="form-group row">
      <label class="col-2 col-form-label">Autocomplete source</label>
      <div class="col-10">
        <select class="form-control" v-model="settings.acSource">
          <option v-for="option in acSourceList" v-bind:value="option">
            {{ option }}
          </option>
        </select>
      </div>
    </div>
    <button type="submit" class="btn btn-primary" @click.prevent="save">Save</button>
  </form>
</template>

<script>
import Settings from '../popup/store/modules/Settings.js';

const state = Settings.state;

export default {
  data: () => ({
    engineList: ['google'],
    acSourceList: ['google'],
    settings: {
    }
  }),
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
