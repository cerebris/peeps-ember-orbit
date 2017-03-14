/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    // Add options here
    orbit: {
      sources: [
        '@orbit/jsonapi',
        '@orbit/indexeddb',
        '@orbit/local-storage'
      ]
    }
  });

  app.import(app.bowerDirectory + '/js-md5/js/md5.js');

  return app.toTree();
};
