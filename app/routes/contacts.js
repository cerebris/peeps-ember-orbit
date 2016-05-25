import Ember from 'ember';
import qb from 'orbit-common/query/builder';

export default Ember.Route.extend({
  model() {
    this.store.query(qb.records('contact'));
    return this.store.cache.liveQuery(qb.records('contact').filterAttributes({ lastName: 'Gebhardt' }));

    // return this.store.liveQuery(qb.records('contact'));
  }
});
