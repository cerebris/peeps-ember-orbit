import Ember from 'ember';

export default Ember.Route.extend({
  renderTemplate() {
    this.render({
      into: 'contacts',
      outlet: 'detail'
    });
  }
});
