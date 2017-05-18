import {
  RequestStrategy
} from '@orbit/coordinator';

export default {
  create() {
    // Push updates to the server pessimistically
    return new RequestStrategy({
      name: 'store-remote-update-pessimistic',

      source: 'store',
      on: 'beforeUpdate',

      target: 'remote',
      action: 'push',

      blocking: true,

      catch(e) {
        console.log('error performing remote.push', e);
        this.source.requestQueue.skip();
        this.target.requestQueue.skip();

        throw e;
      }
    });
  }
};
