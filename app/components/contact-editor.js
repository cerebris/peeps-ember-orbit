import Ember from 'ember';
import qb from 'orbit-common/query/builder';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  storeModel: null,
  model: null,
  isNew: Ember.computed.none('storeModel'),

  init() {
    this._super(...arguments);

    this.transaction = this.get('store').createTransaction();

    if (this.get('isNew')) {
      this.transaction.addRecord({type: 'contact'})
        .then(contact => this.set('model', contact));

    } else {
      let storeModel = this.get('storeModel');
      let model = this.transaction.cache.query(qb.record(storeModel));
      this.set('model', model);
    }
  },

  didInsertElement() {
    this.$('input:first').focus();
  },

  actions: {
    addPhoneNumber() {
      this.transaction
        .addRecord({type: 'phoneNumber'})
        .then((phoneNumber) => {
          this.get('model.phoneNumbers').pushObject(phoneNumber);
        });
    },

    removePhoneNumber(phoneNumber) {
      this.get('model.phoneNumbers')
        .removeObject(phoneNumber)
        .then(() => phoneNumber.remove());
    },

    save() {
      this.transaction
        .commit()
        .then(() => {
          let model = this.get('model');
          let storeModel = this.get('store').cache.query(qb.record(model));
          this.sendAction('success', storeModel);
        });
    },

    cancel() {
      this.sendAction('cancel');
    }
  }
});
