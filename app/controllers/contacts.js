import Ember from 'ember';

const { get } = Ember;

export default Ember.Controller.extend({
  dataCoordinator: Ember.inject.service(),

  actions: {
    clearAll() {
      const coordinator = get(this, 'dataCoordinator');

      let store = coordinator.getSource('store');
      let backup = coordinator.getSource('backup');
      let remote = coordinator.getSource('remote');

      coordinator.deactivate()
        .then(() => {
          [store, backup, remote].forEach(source => {
            if (source) {
              source.transformLog.clear();
              source.requestQueue.clear();
              source.syncQueue.clear();
            }
          });

          if (backup) {
            return backup.deleteDB()
              .then(() => {
                backup.openDB();
              })
              .then(() => {
                store.cache.reset();
                return coordinator.activate();
              })
              .then(() => {
                this.transitionToRoute('index');
              });
          } else {
            store.cache.reset();
            return coordinator.activate()
              .then(() => {
                this.transitionToRoute('index');
              });
          }
        });
    }
  }
});
