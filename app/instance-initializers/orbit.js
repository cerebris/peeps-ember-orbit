import Orbit from 'orbit';
// import Coordinator from 'orbit/coordinator';
import JSONAPISource from 'orbit-jsonapi/jsonapi-source';
import LocalStorageSource from 'orbit-local-storage/local-storage-source';
import IndexedDBSource from 'orbit-indexeddb/indexeddb-source';
import {
  ClientError,
  NetworkError
} from 'orbit/lib/exceptions';
import fetch from 'ember-network/fetch';

export function initialize(appInstance) {
  Orbit.fetch = fetch;

  let storeService = appInstance.lookup('service:store');
  let store = storeService.orbitStore;
  let schema = store.schema;
  // let backup = new LocalStorageSource({ schema, namespace: 'peeps' });
  let backup = new IndexedDBSource({ schema, dbName: 'peeps' });
  let remote = new JSONAPISource({ schema, keyMap: store.keyMap });

  appInstance.register('data-source:backup', backup, { instantiate: false });
  appInstance.register('data-source:remote', remote, { instantiate: false });

  store.on('transform', transform => console.log(transform));

  // let coordinator = appInstance.lookup('service:coordinator');
  // coordinator.addSource(store);
  // coordinator.addSource(backup);
  // coordinator.addSource(remote);

  // // push update requests to the server
  // store.on('update', transform => { remote.push(transform); });
  //
  // // handle server errors
  // remote.on('pushFail', (transform, e) => {
  //   console.log('pushFail', transform.id, e);
  //
  //   if (e instanceof NetworkError) {
  //     // When network errors are encountered, try again in 5s
  //     setTimeout(() => {
  //       console.log('NetworkError - trying again', transform.id);
  //       remote.requestQueue.retry();
  //     }, 5000);
  //   } else if (e instanceof ClientError) {
  //     // Roll back client errors
  //     if (store.transformLog.contains(transform.id)) {
  //       console.log('Rolling back', transform.id);
  //       store.rollback(transform.id, -1);
  //       remote.requestQueue.clear();
  //     }
  //   }
  // });
  //
  // // sync remote changes with the store
  // remote.on('transform', transform => { store.sync(transform); });
}

export default {
  name: 'orbit',
  initialize
};
