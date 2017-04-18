import Ember from 'ember';

const {
  computed, 
  get,
  getOwner,
  set
} = Ember;

export default Ember.Component.extend({
  source: null,
  sourceName: null,
  length: 0,

  init() {
    this._super();
    const sourceName = get(this, 'sourceName');
    const source = getOwner(this).lookup(`data-source:${sourceName}`);
    const requestQueue = source.requestQueue;

    set(this, 'source', source);
    set(this, 'length', requestQueue.length);

    requestQueue.on('change', () => {
      set(this, 'length', requestQueue.length);
    });
  },

  requests: computed('length', {
    get() {
      return get(this, 'source').requestQueue.entries;
    }
  }),

  actions: {
    clear() {
      get(this, 'source').requestQueue.clear();
    }
  }
});
