import Coordinator from 'orbit-common/coordinator';
import JSONAPISource from 'orbit-common/jsonapi-source';
import LocalStorageSource from 'orbit-common/local-storage-source';
import Orbit from 'orbit';
import Ember from 'ember';
import qb from 'orbit-common/query/builder';

// import {
//   addRecord,
//   addToHasMany
// } from 'orbit-common/transform/operators';

export function initialize(appInstance) {
  Orbit.ajax = Ember.$.ajax;

  let coordinator = new Coordinator();
  let store = appInstance.lookup('service:store').orbitStore;
  let schema = store.schema;

  coordinator.addNode('master', {
    sources: [store]
  });

  let localStorage = new LocalStorageSource({ schema, namespace: 'peeps' });

  coordinator.addNode('backup', {
    sources: [localStorage]
  });

  coordinator.defineStrategy({
    type: 'transform',
    sourceNode: 'master',
    targetNode: 'backup',
    blocking: false
  });

  if (true) {
    let jsonApiSource = new JSONAPISource({ schema, keyMap: store.keyMap });

    coordinator.addNode('upstream', {
      sources: [jsonApiSource]
    });

    coordinator.defineStrategy({
      type: 'request',
      sourceNode: 'master',
      targetNode: 'upstream',
      sourceEvent: 'beforeUpdate',
      targetRequest: 'transform',
      blocking: true,
      mergeTransforms: true
    });

    coordinator.defineStrategy({
      type: 'request',
      sourceNode: 'master',
      targetNode: 'upstream',
      sourceEvent: 'beforeQuery',
      targetRequest: 'fetch',
      blocking: true,
      mergeTransforms: true
    });

  } else {
    // load data from local storage
    localStorage.fetch(qb.records())
      .then(transforms => {
        transforms.forEach(transform => {
          store.transform(transform);
        });
      });
  }

  // store.update([
  //   addRecord({type: 'phoneNumber', id: '4', attributes: {phoneNumber: '123'}}),
  //   addRecord({type: 'contact', id: '1', attributes: {firstName: 'Dan', lastName: 'Gebhardt', email: 'dan@cerebris.com'}}),
  //   addToHasMany({type: 'contact', id: '1'}, 'phoneNumbers', {type: 'phoneNumber', id: '4'}),
  //   addRecord({type: 'contact', id: '2', attributes: {firstName: 'Tom', lastName: 'ster', email: 'tomster@emberjs.com'}})
  // ]);
}

export default {
  name: 'orbit',
  initialize
};
