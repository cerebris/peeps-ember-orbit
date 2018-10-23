import { computed } from '@ember/object';
import {
  Model,
  attr,
  hasMany
} from 'ember-orbit';

export default Model.extend({
  firstName: attr('string'),
  lastName: attr('string'),
  email: attr('string'),
  twitter: attr('string'),
  phoneNumbers: hasMany('phoneNumber', { inverse: 'contact' }),

  fullName: computed('firstName', 'lastName', function() {
    let firstName = this.firstName;
    let lastName = this.lastName;

    if (firstName && lastName) {
      return firstName + ' ' + lastName;

    } else if (firstName) {
      return firstName;

    } else if (lastName) {
      return lastName;

    } else {
      return '(No name)';
    }
  })
});
