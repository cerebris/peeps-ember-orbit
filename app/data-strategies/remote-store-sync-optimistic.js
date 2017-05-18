import {
  SyncStrategy
} from '@orbit/coordinator';

export default {
  create() {
    // Sync all remote changes with the store
    return new SyncStrategy({
      name: 'remote-store-sync-optimistic',
      source: 'remote',
      target: 'store',
      blocking: false
    });
  }
};