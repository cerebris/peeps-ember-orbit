/* globals md5 */

import { computed } from '@ember/object';

import Component from '@ember/component';

export default Component.extend({
  size: 100,
  email: '',

  gravatarUrl: computed('email', 'size', function() {
    return `http://www.gravatar.com/avatar/${md5(this.email)}?s=${this.size}`;
  })
});
