import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('contacts', function() {
    this.route('contact', { path: ':contact_id', resetNamespace:true }, function() {
      this.route('edit');
    });
    this.route('new');
  });
});

export default Router;
