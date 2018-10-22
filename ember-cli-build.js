'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

const SW_VERSION = '2';

module.exports = function(defaults) {
  const app = new EmberApp(defaults, {
    'ember-service-worker': {
      registrationStrategy: 'inline'
    },
    'asset-cache': {
      include: ['assets/**/*'],
      version: SW_VERSION
    },
    'esw-cache-fallback': {
      patterns: ['/'],
      version: SW_VERSION
    },
    vendorFiles: {
      'jquery.js': null
    },
    // Orbit-specific options
    orbit: {
      packages: [
        '@orbit/jsonapi',
        '@orbit/indexeddb',
        '@orbit/local-storage',
        '@orbit/indexeddb-bucket',
        '@orbit/local-storage-bucket'
      ]
    },

    'ember-bootstrap': {
      'bootstrapVersion': 4,
      'importBootstrapFont': false,
      'importBootstrapCSS': false
    }
  });

  app.import('vendor/md5.js');

  return app.toTree();
};
