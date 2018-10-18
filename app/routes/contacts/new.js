import Route from '@ember/routing/route';

export default Route.extend({
  renderTemplate() {
    this.render({
      into: 'contacts',
      outlet: 'detail'
    });
  },

  actions: {
    contactCreated() {
      this.transitionTo('contacts.index');
    },

    cancelContactCreation() {
      this.transitionTo('contacts.index');
    }
  }
});
