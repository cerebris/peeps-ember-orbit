import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | contacts/new', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:contacts/new');
    assert.ok(route);
  });
});
