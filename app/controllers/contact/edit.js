import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    contactUpdated() {
      this.transitionToRoute('index');
    },

    cancelContactEditing() {
      this.transitionToRoute('index');
    }
  }
});
