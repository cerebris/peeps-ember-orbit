import LocalStorageBucket from '@orbit/local-storage-bucket';
import IndexedDBBucket, { supportsIndexedDB } from '@orbit/indexeddb-bucket';

export default {
  create() {
    let BucketClass = supportsIndexedDB ? IndexedDBBucket : LocalStorageBucket;
    return new BucketClass({ namespace: 'peeps-settings' });
  }
};
