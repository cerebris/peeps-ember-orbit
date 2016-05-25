import Ember from 'ember';
import OrbitInitializer from 'peeps-ember-orbit/initializers/orbit';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | orbit', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  OrbitInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
