import Route from '@ember/routing/route';

export default Route.extend({
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
