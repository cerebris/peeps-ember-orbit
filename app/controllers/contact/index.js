import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    edit() {
      this.transitionToRoute('contact.edit');
    },

    remove() {
      this.get('model')
        .remove()
        .then(() => this.transitionToRoute('contacts.index'));
    }
  }
});
