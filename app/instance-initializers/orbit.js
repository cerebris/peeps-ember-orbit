import Orbit from 'orbit';
// import Coordinator from 'orbit/coordinator';
import JSONAPISource from 'orbit-jsonapi/jsonapi-source';
// import LocalStorageSource from 'orbit-local-storage/local-storage-source';
import IndexedDBSource from 'orbit-indexeddb/indexeddb-source';
import IndexedDBBucket from 'orbit-indexeddb/indexeddb-bucket';
import {
  ClientError,
  NetworkError
} from 'orbit/lib/exceptions';
import fetch from 'ember-network/fetch';

export function initialize(appInstance) {
  Orbit.fetch = fetch;

  let bucket = new IndexedDBBucket({ dbName: 'peeps-bucket' });

  let storeService = appInstance.lookup('service:store');
  let store = storeService.orbitStore;
  let schema = store.schema;
  // let backup = new LocalStorageSource({ schema, namespace: 'peeps' });
  let backup = new IndexedDBSource({ schema, bucket, dbName: 'peeps' });
  let remote = new JSONAPISource({ schema, bucket, keyMap: store.keyMap });

  appInstance.register('data-source:backup', backup, { instantiate: false });
  appInstance.register('data-source:remote', remote, { instantiate: false });

  store.on('transform', transform => console.log(transform));

  // Push update requests to the server
  store.on('update', transform => {
    console.log('store updated, will push to remote - transform:', transform, 'queue backlog:', remote.requestQueue.length);
    remote.push(transform);
  });

  // Handle server errors
  remote.on('pushFail', (transform, e) => {
    console.log('pushFail', transform.id, e);

    if (e instanceof NetworkError) {
      // When network errors are encountered, try again in 5s
      console.log('NetworkError - will try again soon - transform:', transform.id);
      setTimeout(() => {
        remote.requestQueue.retry();
      }, 5000);
    } else if (e instanceof ClientError) {
      // Roll back client errors
      if (store.transformLog.contains(transform.id)) {
        console.log('Rolling back - transform:', transform.id);
        store.rollback(transform.id, -1);
        remote.requestQueue.clear();
      }
    }
  });

  // Sync remote changes with the store
  remote.on('transform', transform => { store.sync(transform); });

  // let coordinator = appInstance.lookup('service:coordinator');
  // coordinator.addSource(store);
  // coordinator.addSource(backup);
  // coordinator.addSource(remote);
}

export default {
  name: 'orbit',
  initialize
};
