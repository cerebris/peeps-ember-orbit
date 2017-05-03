import Ember from 'ember';
import { oqb } from '@orbit/data';

const { get, inject, Route } = Ember;

export default Route.extend({
  dataCoordinator: inject.service(),

  beforeModel() {
    const coordinator = get(this, 'dataCoordinator');
    const backup = coordinator.getSource('backup');

    if (backup) {
      // Warm the store's cache from backup and then activate the coordinator
      const store = coordinator.getSource('store');
      return backup.pull(oqb.records())
        .then(transform => store.sync(transform))
        .then(() => coordinator.activate());
    } else {
      return coordinator.activate();
    }
  }
});
