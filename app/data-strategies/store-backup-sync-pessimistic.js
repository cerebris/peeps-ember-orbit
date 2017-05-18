import {
  SyncStrategy
} from '@orbit/coordinator';

export default {
  create() {
    // Backup all store changes (by making this strategy blocking we ensure that
    // the store can't change without the change also being backed up).
    return new SyncStrategy({
      name: 'store-backup-sync-pessimistic',
      source: 'store',
      target: 'backup',
      blocking: true
    });
  }
};
