import Ember from 'ember';

export default Ember.Route.extend({
  renderTemplate() {
    this.render({
      into: 'contacts',
      outlet: 'detail'
    });
  },

  actions: {
    contactUpdated() {
      this.transitionTo('contact.index');
    },

    cancelContactEditing() {
      this.transitionTo('contact.index');
    }
  }
});
