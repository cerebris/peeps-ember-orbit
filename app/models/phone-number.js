import Model from 'ember-orbit/model';
import attr from 'ember-orbit/fields/attr';
import hasOne from 'ember-orbit/fields/has-one';

export default Model.extend({
  name: attr('string'),
  phoneNumber: attr('string'),
  contact: hasOne('contact', { inverse: 'phoneNumbers' })
});
