import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    edit() {
      this.transitionToRoute('contact.edit');
    },

    async remove() {
      await this.model.remove({ label: 'Remove contact' });
      this.transitionToRoute('contacts.index');
    }
  }
});
