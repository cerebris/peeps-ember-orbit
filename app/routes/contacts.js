import Ember from 'ember';
import { 
  QueryBuilder as qb
} from '@orbit/core';

export default Ember.Route.extend({
  model() {
    // let query = qb.records('contact').filterAttributes({ lastName: 'Gebhardt' }).sort('lastName', 'firstName');
    let query = qb.records('contact').sort('lastName', 'firstName');
    return this.store.liveQuery(query);
  }
});
