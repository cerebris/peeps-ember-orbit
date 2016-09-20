import Orbit from 'orbit';
import Source from 'ember-orbit/source';
import Bucket from 'ember-orbit/bucket';
import JSONAPISource from 'orbit-jsonapi/jsonapi-source';
// import LocalStorageSource from 'orbit-local-storage/local-storage-source';
import IndexedDBSource from 'orbit-indexeddb/indexeddb-source';
import IndexedDBBucket from 'orbit-indexeddb/indexeddb-bucket';
import fetch from 'ember-network/fetch';

const RemoteSource = Source.extend({
  OrbitSourceClass: JSONAPISource
});

const BackupSource = Source.extend({
  OrbitSourceClass: IndexedDBSource,
  orbitSourceOptions: { namespace: 'peeps' }
});

const SettingsBucket = Bucket.extend({
  OrbitBucketClass: IndexedDBBucket,
  orbitBucketOptions: { namespace: 'peeps-settings' }
});

export function initialize(application) {
  Orbit.fetch = fetch;

  application.register('data-source:remote', RemoteSource);
  application.register('data-source:backup', BackupSource);

  application.register('data-bucket:main', SettingsBucket);
  application.inject('data-source', 'bucket', 'data-bucket:main');
}

export default {
  name: 'data',
  initialize
};
