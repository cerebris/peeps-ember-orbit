import {
  ClientError,
  NetworkError
} from 'orbit/lib/exceptions';

export function initialize(appInstance) {
  let store = appInstance.lookup('service:store');
  let remote = appInstance.lookup('data-source:remote');

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
}

export default {
  name: 'orbit',
  initialize
};
