import Ember from 'ember';

const { getOwner } = Ember;

export default Ember.Controller.extend({
  actions: {
    clearAll() {
      const owner = getOwner(this);

      let store = owner.lookup('service:store');
      let backup = owner.lookup('data-source:backup');
      let remote = owner.lookup('data-source:remote');

      [store, backup, remote].forEach(source => {
        let orbitSource = source.orbitSource;

        orbitSource.transformLog.clear();
        orbitSource.requestQueue.clear();
        orbitSource.syncQueue.clear();
      });

      backup.orbitSource.deleteDB()
        .then(() => {
          backup.orbitSource.openDB()
        })
        .then(() => {
          store.orbitSource.cache.reset();
          this.transitionToRoute('index');
        });
    }
  }
});
