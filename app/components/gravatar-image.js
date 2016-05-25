/* globals md5 */

import Ember from 'ember';

export default Ember.Component.extend({
  size: 100,
  email: '',

  gravatarUrl: Ember.computed('email', 'size', function() {
    let email = this.get('email');
    let size = this.get('size');

    return 'http://www.gravatar.com/avatar/' + md5(email) + '?s=' + size;
  })
});
