import Ember from 'ember';
import DataInitializer from 'peeps-ember-orbit/initializers/data';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | data', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  DataInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
