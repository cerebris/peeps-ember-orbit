import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    modeChanged() {
      this.transitionToRoute('index');
    }
  }
});
