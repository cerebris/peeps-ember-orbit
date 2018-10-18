import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import { set, get, computed } from '@ember/object';

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

    let sources = get(this, 'sources');
    set(this, 'activeSource', sources[0]);
  },

  sources: computed('activeMode', {
    get() {
      return Object.values(get(this, 'dataCoordinator.sources'));
    }
  }),

  sourceNames: computed('activeMode', {
    get() {
      return Object.keys(get(this, 'dataCoordinator.sources'));
    }
  }),

  activeSource: computed({
    set(key, source) {
      set(this, 'requestQueueLength', source.requestQueue.length);
      set(this, 'syncQueueLength', source.syncQueue.length);
      set(this, 'transformLogLength', source.transformLog.length);

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
      return get(this, 'activeSource.requestQueue.entries').slice().reverse();
    }
  }),

  _requestQueueChange() {
    let source = get(this, 'activeSource');
    set(this, 'requestQueueLength', source.requestQueue.length);
  },

  syncQueueEntries: computed('syncQueueLength', {
    get() {
      return get(this, 'activeSource.syncQueue.entries').slice().reverse();
    }
  }),

  _transformLogChange() {
    let source = get(this, 'activeSource');
    set(this, 'transformLogLength', source.transformLog.length);
  },

  transformLogEntries: computed('transformLogLength', {
    get() {
      return get(this, 'activeSource.transformLog.entries').slice().reverse();
    }
  }),

  _syncQueueChange() {
    let source = get(this, 'activeSource');
    set(this, 'syncQueueLength', source.syncQueue.length);
  },

  actions: {
    switchSource(source) {
      set(this, 'activeSource', source);
    },

    switchMode(mode) {
      let configuration = get(this, 'orbitConfiguration');
      configuration.configure(mode)
        .then(() => {
          get(this, 'onModeChange')();
        });
    }
  }
});
