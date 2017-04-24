import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    return this.store.cache.find('contact', params.contact_id);
    // , { 
    // return this.store.find('contact', params.contact_id, { 
    //   label: 'Find contact',
    //   sources: {
    //     remote: {
    //       include: ['phone-numbers']
    //     }
    //   }
    // });
  },

  afterModel(model) {
    this.transitionTo('contact.index', model);
  }
});
