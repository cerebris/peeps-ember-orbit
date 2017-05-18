import {
  RequestStrategy
} from '@orbit/coordinator';

export default {
  create() {
    // Pull query results from the server
    return new RequestStrategy({
      name: 'store-remote-query-optimistic',

      source: 'store',
      on: 'beforeQuery',

      target: 'remote',
      action: 'pull',

      blocking: false,

      catch(e) {
        console.log('error performing remote.pull', e);
        this.source.requestQueue.skip();
        this.target.requestQueue.skip();

        throw e;
      }
    });
  }
};