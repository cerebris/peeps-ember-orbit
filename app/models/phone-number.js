import {
  Model,
  attr,
  hasOne
} from 'ember-orbit';

export default Model.extend({
  name: attr('string'),
  phoneNumber: attr('string'),
  contact: hasOne('contact', { inverse: 'phoneNumbers' })
});
