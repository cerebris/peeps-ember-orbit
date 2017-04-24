import {
  ClientError,
  NetworkError
} from '@orbit/data';

export function initialize(appInstance) {
  let store = appInstance.lookup('service:store');
  let remote = appInstance.lookup('data-source:remote');

  store.on('transform', transform => console.log(transform));

  // Push update requests to the server
  store.on('update', transform => {
    console.log('store updated, will push to remote - transform:', transform, 'queue backlog:', remote.requestQueue.length);
    remote.push(transform);
  });

  // Optimistic flow
  // 1. store.query
  // beforeQuery -> 2. remote.pull
  // transform -> 4. store.sync
  // 3. return store.cache.query

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
