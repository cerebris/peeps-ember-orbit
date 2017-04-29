import Orbit, {
  ClientError,
  NetworkError
} from '@orbit/data';
import JSONAPISource from '@orbit/jsonapi';
import LocalStorageSource from '@orbit/local-storage';
import LocalStorageBucket from '@orbit/local-storage-bucket';
import IndexedDBSource, { supportsIndexedDB } from '@orbit/indexeddb';
import IndexedDBBucket from '@orbit/indexeddb-bucket';
import fetch from 'ember-network/fetch';

export function initialize(appInstance) {
  Orbit.fetch = fetch;

  let store = appInstance.lookup('service:store');
  let coordinator = appInstance.lookup('service:data-coordinator');
  let schema = appInstance.lookup('service:data-schema');
  let keyMap = appInstance.lookup('service:data-key-map');

  let BucketClass = supportsIndexedDB ? IndexedDBBucket : LocalStorageBucket;
  let bucket = new BucketClass({ namespace: 'peeps-settings' });

  let BackupClass = supportsIndexedDB ? IndexedDBSource : LocalStorageSource;
  let backup = new BackupClass({ name: 'backup', namespace: 'peeps', bucket, keyMap, schema });
  let remote = new JSONAPISource({ name: 'remote', bucket, keyMap, schema });

  coordinator.addSource(backup);
  coordinator.addSource(remote);

  store.on('transform', transform => console.log(transform));

  // Push update requests to the server
  store.on('update', transform => {
    console.log('store updated, will push to remote - transform:', transform, 'queue backlog:', remote.requestQueue.length);
    remote.push(transform);
  });

  store.on('beforeQuery', query => {
    remote.pull(query)
      .then(() => {
        console.log('pull success', query.id);
      })
      .catch((e) => {
        console.log('pull error', query.id, e);
      });
  });

  remote.on('beforePull', (query) => {
    console.log('beforePull', query);
  });

  // Handle server errors
  remote.on('pullFail', (query, e) => {
    console.log('pullFail', query.id, e);

    if (e instanceof NetworkError) {
      console.log('NetworkError - query:', query.id);
    } else if (e instanceof ClientError) {
      console.log('ClientError - query:', query.id);
    }

    remote.requestQueue.skip();
  });

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
  remote.on('transform', transform => { 
    store.sync(transform); 
  });
}

export default {
  name: 'orbit',
  initialize
};
