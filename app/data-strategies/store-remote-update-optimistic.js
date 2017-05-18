import {
  RequestStrategy
} from '@orbit/coordinator';

export default {
  create() {
    // Push updates to the server optimistically
    return new RequestStrategy({
      name: 'store-remote-update-optimistic',

      source: 'store',
      on: 'beforeUpdate',

      target: 'remote',
      action: 'push',

      blocking: false
    });
  }
};
