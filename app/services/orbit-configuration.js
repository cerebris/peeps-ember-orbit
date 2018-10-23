import Service, { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';

export default Service.extend({
  // Inject all of the ember-orbit services
  store: service(),
  dataCoordinator: service(),

  mode: null,
  bucket: null,
  availableModes: null,

  init() {
    this._super();
    this.set('availableModes', [
      { id: 'memory-only', description: 'store' },
      { id: 'offline-only', description: 'store + backup' },
      { id: 'pessimistic-server', description: 'store + remote' },
      { id: 'optimistic-server', description: 'store + remote + backup' }
    ]);
  },

  initialize() {
    let mode = window.localStorage.getItem('peeps-mode') || 'offline-only';
    return this.configure(mode);
  },

  addSource(name) {
    const owner = getOwner(this);
    const source = owner.lookup(`data-source:${name}`);
    this.dataCoordinator.addSource(source);
  },

  addStrategy(name) {
    const owner = getOwner(this);
    const strategy = owner.lookup(`data-strategy:${name}`);
    this.dataCoordinator.addStrategy(strategy);
  },

  async configure(mode) {
    if (mode === this.mode) { return; }

    console.log('[orbit-configuration]', 'mode', mode);

    const coordinator = this.dataCoordinator;

    await this.clearActiveConfiguration()

    this.set('mode', mode);
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

      let transform = await backup.pull(q => q.findRecords());

      await store.sync(transform);
      await backup.transformLog.clear();
      await store.transformLog.clear();
      await coordinator.activate();

    } else {
      await coordinator.activate();
    }

    console.log('[orbit-configuration]', 'sources', coordinator.sourceNames);
    console.log('[orbit-configuration]', 'strategies', coordinator.strategyNames);
  },

  async clearActiveConfiguration() {
    const coordinator = this.dataCoordinator;
    const wasActive = !!coordinator.activated;

    await coordinator.deactivate();

    // Reset the backup source (if it exists and was active).
    // This ensures the new configuration starts with a fresh state.
    let backup = coordinator.getSource('backup');
    if (wasActive && backup) {
      await backup.reset();
    }

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
  }
});
