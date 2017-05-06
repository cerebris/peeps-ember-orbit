import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    modeChanged() {
      this.transitionToRoute('index');
    }
  }
});
