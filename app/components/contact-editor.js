import { none } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  store: service(),
  storeModel: null,
  model: null,
  isNew: none('storeModel'),

  async init() {
    this._super(...arguments);

    this.forkedStore = this.store.fork();

    let model;
    if (this.isNew) {
      model = await this.forkedStore.addRecord({type: 'contact'})
    } else {
      let storeModel = this.storeModel;
      model = this.forkedStore.cache.findRecord(storeModel.type, storeModel.id);
    }

    this.set('model', model);
  },

  didInsertElement() {
    this.element.querySelector('input').focus();
  },

  willDestroy() {
    this._super(...arguments);
    if (this.forkedStore) {
      this.forkedStore.destroy();
    }
  },

  actions: {
    async addPhoneNumber() {
      let phoneNumber = await this.forkedStore.addRecord({type: 'phoneNumber'});

      this.model.phoneNumbers.pushObject(phoneNumber);

      window.requestAnimationFrame(() => {
        let inputs = this.element.querySelectorAll('input.phone-number');
        inputs[inputs.length - 1].focus();
      });
    },

    async removePhoneNumber(phoneNumber) {
      await this.model.phoneNumbers.removeObject(phoneNumber);
      await phoneNumber.remove();
    },

    async save() {
      try {
        await this.store.merge(this.forkedStore,
          { transformOptions: { label: 'Save contact' }});

        let model = this.model;
        let storeModel = this.store.cache.findRecord(model.type, model.id,
          { label: 'Find contact' });

        this.onSuccess(storeModel);

      } catch(e) {
        // Note: Remote errors will only be caught here with a pessimistic update strategy.
        // In the optimistic case, remote errors will occur after the local update has
        // succeeded.
        alert('Contact could not be saved');
      }
    },

    cancel() {
      this.onCancel();
    }
  }
});
