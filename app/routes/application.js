import Ember from 'ember';
import { oqb } from '@orbit/data';

const { get, inject, Route } = Ember;

export default Route.extend({
  dataCoordinator: inject.service(),

  beforeModel() {
    const backup = get(this, 'dataCoordinator').sources['backup'];
    const store = this.store;

    // Warm the store's cache from backup
    return backup.pull(oqb.records())
      .then(transform => store.sync(transform))
      .then(() => {
        // Backup subsequent changes to the store
        store.on('transform', transform => backup.sync(transform));
      });
  }
});
