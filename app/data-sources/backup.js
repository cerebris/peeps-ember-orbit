import LocalStorageSource from '@orbit/local-storage';
import IndexedDBSource, { supportsIndexedDB } from '@orbit/indexeddb';

export default {
  create(injections = {}) {
    injections.name = 'backup';
    injections.namespace = 'peeps';

    const BaseClass = supportsIndexedDB ? IndexedDBSource : LocalStorageSource;
    return new BaseClass(injections);
  }
};
