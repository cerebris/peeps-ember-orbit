import Ember from 'ember';
import qb from 'orbit/query/builder';

export default Ember.Route.extend({
  model() {
    // return this.store.liveQuery(qb.records('contact').filterAttributes({ lastName: 'Gebhardt' }));

    return this.store.liveQuery(qb.records('contact'));
  }
});
