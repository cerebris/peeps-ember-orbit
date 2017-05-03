import Orbit, {
  ClientError,
  NetworkError
} from '@orbit/data';
import {
  EventLoggingStrategy,
  LogTruncationStrategy,
  RequestStrategy,
  SyncStrategy
} from '@orbit/coordinator';
import JSONAPISource from '@orbit/jsonapi';
import LocalStorageSource from '@orbit/local-storage';
import LocalStorageBucket from '@orbit/local-storage-bucket';
import IndexedDBSource, { supportsIndexedDB } from '@orbit/indexeddb';
import IndexedDBBucket from '@orbit/indexeddb-bucket';
import fetch from 'ember-network/fetch';

export function initialize(appInstance) {
  let offlineMode = false;

  Orbit.fetch = fetch;

  let store = appInstance.lookup('service:store');
  let coordinator = appInstance.lookup('service:data-coordinator');
  let schema = appInstance.lookup('service:data-schema');
  let keyMap = appInstance.lookup('service:data-key-map');

  let BucketClass = supportsIndexedDB ? IndexedDBBucket : LocalStorageBucket;
  let bucket = new BucketClass({ namespace: 'peeps-settings' });

  let remote = new JSONAPISource({ name: 'remote', bucket, keyMap, schema });

  // Add new sources to the coordinator
  coordinator.addSource(remote);

  // Log all events
  coordinator.addStrategy(new EventLoggingStrategy());

  // Truncate logs as possible
  coordinator.addStrategy(new LogTruncationStrategy());

  // Sync all remote changes with the store
  coordinator.addStrategy(new SyncStrategy({
    source: 'remote',
    target: 'store',
    blocking: !offlineMode
  }));

  // Push update requests to the server
  coordinator.addStrategy(new RequestStrategy({
    source: 'store',
    on: 'update',

    target: 'remote',
    action: 'push',

    blocking: !offlineMode
  }));

  // Pull query results from the server
  coordinator.addStrategy(new RequestStrategy({
    source: 'store',
    on: 'beforeQuery',

    target: 'remote',
    action: 'pull',

    blocking: !offlineMode
  }));

  // Remove pull requests from the remote queue when they fail
  coordinator.addStrategy(new RequestStrategy({
    source: 'remote',
    on: 'pullFail',

    action() {
      this.source.requestQueue.skip();
    }
  }));

  // Handle push failures with a custom strategy
  coordinator.addStrategy(new RequestStrategy({
    source: 'remote',
    on: 'pushFail',

    action(transform, e) {
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
    }
  }));

  // For offline support, add a backup source that syncs with the main store.
  // The store will be populated from backup in the application route (since
  // it's an async operation, it shouldn't be done in an initializer).
  if (offlineMode) {
    let BackupClass = supportsIndexedDB ? IndexedDBSource : LocalStorageSource;
    let backup = new BackupClass({ name: 'backup', namespace: 'peeps', bucket, keyMap, schema });
    coordinator.addSource(backup);

    // Backup all store changes (by making this strategy blocking we ensure that
    // the store can't change without the change also being backed up).
    coordinator.addStrategy(new SyncStrategy({
      source: 'store',
      target: 'backup',
      blocking: true
    }));
  }
}

export default {
  name: 'data-configuration',
  initialize
};
