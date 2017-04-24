import Ember from 'ember';
import { 
  oqb
} from '@orbit/data';

export default Ember.Route.extend({
  model() {
    let query = oqb.records('contact').sort('lastName', 'firstName');
    return this.store.liveQuery(query, {
      label: 'Find all contacts',
      sources: {
        remote: {
          include: ['phone-numbers']
        }
      }
    });
  }
});
