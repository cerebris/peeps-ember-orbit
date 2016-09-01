import Ember from 'ember';
import qb from 'orbit/query/builder';

const { getOwner } = Ember;

export default Ember.Route.extend({
  beforeModel() {
    const owner = getOwner(this);
    const backup = owner.lookup('data-source:backup');
    const store = owner.lookup('service:store').orbitStore;

    // warm the store's cache from backup
    return backup.pull(qb.records())
      .then(transforms => store.sync(transforms))
      .then(() => {
        // backup subsequent changes to the store
        store.on('transform', transform => backup.sync(transform));
      });
  }
});
