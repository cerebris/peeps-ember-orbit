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
import { oqb } from '@orbit/data';
import JSONAPISource from '@orbit/jsonapi';
import LocalStorageSource from '@orbit/local-storage';
import LocalStorageBucket from '@orbit/local-storage-bucket';
import IndexedDBSource, { supportsIndexedDB } from '@orbit/indexeddb';
import IndexedDBBucket from '@orbit/indexeddb-bucket';
import fetch from 'ember-network/fetch';
import Ember from 'ember';

const { get, set, inject } = Ember;

export default Ember.Service.extend({
  // Inject all of the ember-orbit services
  store: inject.service(),
  dataCoordinator: inject.service(),
  dataSchema: inject.service(),
  dataKeyMap: inject.service(),

  mode: null,
  bucket: null,

  availableModes: [
    { id: 'memory-only', description: 'store' },
    { id: 'offline-only', description: 'store + backup' },
    { id: 'pessimistic-server', description: 'store + remote' },
    { id: 'optimistic-server', description: 'store + remote + backup' }
  ],

  init() {
    this._super(...arguments);

    let BucketClass = supportsIndexedDB ? IndexedDBBucket : LocalStorageBucket;
    let bucket = new BucketClass({ namespace: 'peeps-settings' });
    set(this, 'bucket', bucket);
  },

  initialize() {
    let mode = window.localStorage.getItem('peeps-mode') || 'offline-only';
    return this.configure(mode);
  },

  configure(mode) {
    if (mode === get(this, 'mode')) { return; }

    console.log('[orbit-configuration]', 'mode', mode);

    // Instantiate ember-orbit services
    let coordinator = get(this, 'dataCoordinator');
    let store = get(this, 'store');
    let schema = get(this, 'dataSchema');
    let keyMap = get(this, 'dataKeyMap');
    let bucket = get(this, 'bucket');

    return this.clearActiveConfiguration()
      .then(() => {
        set(this, 'mode', mode);
        window.localStorage.setItem('peeps-mode', mode);

        // Log all events
        coordinator.addStrategy(new EventLoggingStrategy());

        // Truncate logs as possible
        coordinator.addStrategy(new LogTruncationStrategy());

        // Configure a remote source
        if (mode === 'pessimistic-server' ||
            mode === 'optimistic-server') {

          // Use `fetch` implementation from `ember-network`
          Orbit.fetch = fetch;

          let pessimisticMode = (mode === 'pessimistic-server');
          let remote = new JSONAPISource({ name: 'remote', bucket, keyMap, schema });
          coordinator.addSource(remote);

          // Sync all remote changes with the store
          coordinator.addStrategy(new SyncStrategy({
            source: 'remote',
            target: 'store',
            blocking: pessimisticMode
          }));

          // Push update requests to the server
          coordinator.addStrategy(new RequestStrategy({
            source: 'store',
            on: 'update',

            target: 'remote',
            action: 'push',

            blocking: pessimisticMode
          }));

          // Pull query results from the server
          coordinator.addStrategy(new RequestStrategy({
            source: 'store',
            on: 'beforeQuery',

            target: 'remote',
            action: 'pull',

            blocking: pessimisticMode
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
        }

        // Configure a backup source
        if (mode === 'offline-only' ||
            mode === 'optimistic-server') {

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

          return backup.pull(oqb.records())
            .then(transform => store.sync(transform))
            .then(() => coordinator.activate());
        } else {
          return coordinator.activate();
        }
      });
  },

  clearActiveConfiguration() {
    let coordinator = get(this, 'dataCoordinator');

    if (coordinator.activated) {
      return coordinator.deactivate()
        .then(() => {
          console.log('[orbit-configuration]', 'resetting browser storage');

          // Reset browser storage
          let backup = coordinator.getSource('backup');
          if (backup) {
            return backup.reset();
          } else {
            return Orbit.Promise.resolve();
          }
        })
        .then(() => {
          console.log('[orbit-configuration]', 'resetting sources and strategies');

          // Reset the store
          let store = coordinator.getSource('store');
          store.transformLog.clear();
          store.requestQueue.clear();
          store.syncQueue.clear();
          store.cache.reset();

          // Remove strategies
          coordinator.strategyNames.forEach(name => coordinator.removeStrategy(name));

          // Remove sources (other than the store)
          coordinator.sourceNames.forEach(name => {
            if (name !== 'store') {
              coordinator.removeSource(name);
            }
          });
        });
    } else {
      return Orbit.Promise.resolve();
    }
  }
});
