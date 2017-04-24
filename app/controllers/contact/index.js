import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    edit() {
      this.transitionToRoute('contact.edit');
    },

    remove() {
      this.get('model')
        .remove({ label: 'Remove contact' })
        .then(() => this.transitionToRoute('contacts.index'));
    }
  }
});
