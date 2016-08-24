import Orbit from 'orbit';
// import Coordinator from 'orbit/coordinator';
import JSONAPISource from 'orbit-jsonapi/jsonapi-source';
import LocalStorageSource from 'orbit-local-storage/local-storage-source';
import qb from 'orbit/query/builder';
import {
  ClientError,
  NetworkError
} from 'orbit/lib/exceptions';
import fetch from 'ember-network/fetch';

export function initialize(appInstance) {
  Orbit.fetch = fetch;

  // let coordinator = new Coordinator();
  let store = appInstance.lookup('service:store').orbitStore;
  let schema = store.schema;
  let backup = new LocalStorageSource({ schema, namespace: 'peeps' });
  let remote = new JSONAPISource({ schema, keyMap: store.keyMap });

  store.on('update',
    transform => {
      remote.push(transform)
        .catch(e => {
          if (e instanceof ClientError) {
            store.rollback(transform.id, -1);
            remote.requestQueue.clear();
          } else {
            throw e;
          }
        });
  });

  // handle remote errors
  remote.on('pushFail', (transform, e) => {
    if (e instanceof NetworkError) {
      // When network errors are encountered, try again in 1s
      setTimeout(() => remote.requestQueue.retry(), 1000);
    }
  });

  // sync remote changes with the store
  remote.on('transform', transform => { store.sync(transform); });

  // warm the store's cache from backup
  backup.pull(qb.records())
    .then(transforms => store.sync(transforms))
    .then(() => {
      // backup subsequent changes to the store
      store.on('transform', transform => backup.sync(transform));
    });
}

export default {
  name: 'orbit',
  initialize
};
