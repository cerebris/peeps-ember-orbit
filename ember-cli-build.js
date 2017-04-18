/*jshint node:true*/
/* global require, module */
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  const app = new EmberApp(defaults, {
    // Orbit-specific options
    orbit: {
      packages: [
        '@orbit/jsonapi',
        '@orbit/indexeddb',
        '@orbit/local-storage',
        '@orbit/indexeddb-bucket',
        '@orbit/local-storage-bucket'
      ]
    }
  });

  app.import(app.bowerDirectory + '/js-md5/js/md5.js');

  return app.toTree();
};
