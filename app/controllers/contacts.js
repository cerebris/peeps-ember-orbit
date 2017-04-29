import Ember from 'ember';

const { get } = Ember;

export default Ember.Controller.extend({
  dataCoordinator: Ember.inject.service(),

  actions: {
    clearAll() {
      const coordinator = get(this, 'dataCoordinator');

      let store = coordinator.sources['store'];
      let backup = coordinator.sources['backup'];
      let remote = coordinator.sources['remote'];

      [store, backup, remote].forEach(source => {
        source.transformLog.clear();
        source.requestQueue.clear();
        source.syncQueue.clear();
      });

      backup.deleteDB()
        .then(() => {
          backup.openDB();
        })
        .then(() => {
          store.cache.reset();
          this.transitionToRoute('index');
        });
    }
  }
});
