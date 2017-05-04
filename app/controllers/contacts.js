import Ember from 'ember';

const { get } = Ember;

export default Ember.Controller.extend({
  actions: {
    modeChanged() {
      this.transitionToRoute('index');
    }
  }
});
