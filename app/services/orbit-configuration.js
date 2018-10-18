import Service, { inject as service } from '@ember/service';
import { set, get } from '@ember/object';
import { getOwner } from '@ember/application';
import Orbit from '@orbit/data';

export default Service.extend({
  // Inject all of the ember-orbit services
  store: service(),
  dataCoordinator: service(),

  mode: null,
  bucket: null,

  availableModes: [
    { id: 'memory-only', description: 'store' },
    { id: 'offline-only', description: 'store + backup' },
    { id: 'pessimistic-server', description: 'store + remote' },
    { id: 'optimistic-server', description: 'store + remote + backup' }
  ],

  initialize() {
    let mode = window.localStorage.getItem('peeps-mode') || 'offline-only';
    return this.configure(mode);
  },

  addSource(name) {
    const owner = getOwner(this);
    const source = owner.lookup(`data-source:${name}`);
    const coordinator = get(this, 'dataCoordinator');
    coordinator.addSource(source);
  },

  addStrategy(name) {
    const owner = getOwner(this);
    const strategy = owner.lookup(`data-strategy:${name}`);
    const coordinator = get(this, 'dataCoordinator');
    coordinator.addStrategy(strategy);
  },

  configure(mode) {
    if (mode === get(this, 'mode')) { return; }

    console.log('[orbit-configuration]', 'mode', mode);

    const coordinator = get(this, 'dataCoordinator');

    return this.clearActiveConfiguration()
      .then(() => {
        set(this, 'mode', mode);
        window.localStorage.setItem('peeps-mode', mode);

        this.addStrategy('event-logging');
        this.addStrategy('log-truncation');

        // Configure a remote source and related strategies
        if (mode === 'pessimistic-server' ||
            mode === 'optimistic-server') {

          this.addSource('remote');

          if (mode === 'pessimistic-server') {
            this.addStrategy('remote-store-sync-pessimistic');
            this.addStrategy('store-remote-query-pessimistic');
            this.addStrategy('store-remote-update-pessimistic');
          } else {
            this.addStrategy('remote-store-sync-optimistic');
            this.addStrategy('store-remote-query-optimistic');
            this.addStrategy('store-remote-update-optimistic');
            this.addStrategy('remote-push-fail');
          }
        }

        // Configure a backup source and related strategies
        if (mode === 'offline-only' ||
            mode === 'optimistic-server') {

          let owner = getOwner(this);
          let backup = owner.lookup('data-source:backup');
          let store = owner.lookup('data-source:store');

          this.addSource('backup');
          this.addStrategy('store-backup-sync-pessimistic');

          return backup.pull(q => q.findRecords())
            .then(transform => store.sync(transform))
            .then(() => backup.transformLog.clear())
            .then(() => store.transformLog.clear())
            .then(() => coordinator.activate());

        } else {
          return coordinator.activate();
        }
      }).then(() => {
        console.log('[orbit-configuration]', 'sources', coordinator.sourceNames);
        console.log('[orbit-configuration]', 'strategies', coordinator.strategyNames);
      });
  },

  clearActiveConfiguration() {
    const coordinator = get(this, 'dataCoordinator');
    const wasActive = !!coordinator.activated;

    return coordinator.deactivate()
      .then(() => {
        // Reset the backup source (if it exists and was active).
        // This ensures the new configuration starts with a fresh state.
        let backup = coordinator.getSource('backup');
        if (wasActive && backup) {
          return backup.reset();
        } else {
          return Orbit.Promise.resolve();
        }
      })
      .then(() => {
        // Clear all strategies
        coordinator.strategyNames.forEach(name => coordinator.removeStrategy(name));

        // Reset and remove sources (other than the store)
        coordinator.sources.forEach(source => {
          source.transformLog.clear();
          source.requestQueue.clear();
          source.syncQueue.clear();

          if (source.name === 'store') {
            // Keep the store around, but reset its cache
            source.cache.reset();
          } else {
            coordinator.removeSource(source.name);
          }
        });
      });
  }
});
