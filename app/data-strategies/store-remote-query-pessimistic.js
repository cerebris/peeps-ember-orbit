import {
  RequestStrategy
} from '@orbit/coordinator';

export default {
  create() {
    // Pull query results from the server
    return new RequestStrategy({
      name: 'store-remote-query-pessimistic',

      source: 'store',
      on: 'beforeQuery',

      target: 'remote',
      action: 'pull',

      blocking: true,

      catch(e) {
        console.log('error performing remote.pull', e);
        this.source.requestQueue.skip();
        this.target.requestQueue.skip();

        throw e;
      }
    });
  }
};
