import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  queues: null,
  dataCoordinator: service(),
  orbitConfiguration: service(),

  requestQueueLength: 0,
  syncQueueLength: 0,
  transformLogLength: 0,

  activeMode: alias('orbitConfiguration.mode'),
  configurationModes: alias('orbitConfiguration.availableModes'),

  init() {
    this._super();
    this.set('activeSource', this.sources[0]);
  },

  sources: computed('activeMode', {
    get() {
      return Object.values(this.dataCoordinator.sources);
    }
  }),

  sourceNames: computed('activeMode', {
    get() {
      return Object.keys(this.dataCoordinator.sources);
    }
  }),

  activeSource: computed({
    set(key, source) {
      this.set('requestQueueLength', source.requestQueue.length);
      this.set('syncQueueLength', source.syncQueue.length);
      this.set('transformLogLength', source.transformLog.length);

      if (this._prevSource) {
        this._prevSource.requestQueue.off('change', this._requestQueueChange, this);
        this._prevSource.syncQueue.off('change', this._syncQueueChange, this);
      }
      source.requestQueue.on('change', this._requestQueueChange, this);
      source.syncQueue.on('change', this._syncQueueChange, this);
      source.transformLog.on('change', this._transformLogChange, this);

      this._prevSource = source;

      return source;
    }
  }),

  requestQueueEntries: computed('requestQueueLength', {
    get() {
      return this.activeSource.requestQueue.entries.slice().reverse();
    }
  }),

  _requestQueueChange() {
    let source = this.activeSource;
    this.set('requestQueueLength', source.requestQueue.length);
  },

  syncQueueEntries: computed('syncQueueLength', {
    get() {
      return this.activeSource.syncQueue.entries.slice().reverse();
    }
  }),

  _transformLogChange() {
    let source = this.activeSource;
    this.set('transformLogLength', source.transformLog.length);
  },

  transformLogEntries: computed('transformLogLength', {
    get() {
      return this.activeSource.transformLog.entries.slice().reverse();
    }
  }),

  _syncQueueChange() {
    this.set('syncQueueLength', this.activeSource.syncQueue.length);
  },

  actions: {
    switchSource(source) {
      this.set('activeSource', source);
    },

    async switchMode(mode) {
      await this.orbitConfiguration.configure(mode);
      this.onModeChange();
    }
  }
});
