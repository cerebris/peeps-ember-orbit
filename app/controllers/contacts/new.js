import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    contactCreated() {
      this.transitionToRoute('contacts.index');
    },

    cancelContactCreation() {
      this.transitionToRoute('contacts.index');
    }
  }
});
