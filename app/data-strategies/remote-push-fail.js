import {
  RequestStrategy
} from '@orbit/coordinator';
import {
  NetworkError
} from '@orbit/data';

export default {
  create() {
    // Push updates to the server optimistically
    return new RequestStrategy({
      name: 'remote-push-fail',

      source: 'remote',
      on: 'pushFail',

      action(transform, e) {
        const coordinator = this.coordinator;
        const remote = coordinator.getSource('remote');
        const store = coordinator.getSource('store');

        if (e instanceof NetworkError) {
          // When network errors are encountered, try again in 5s
          console.log('NetworkError - will try again soon');
          setTimeout(() => {
            remote.requestQueue.retry();
          }, 5000);

        } else {
          // When non-network errors occur, notify the user and
          // reset state.
          let label = transform.options && transform.options.label;
          if (label) {
            alert(`Unable to complete "${label}"`);
          } else {
            alert(`Unable to complete operation`);
          }

          // Roll back store to position before transform
          if (store.transformLog.contains(transform.id)) {
            console.log('Rolling back - transform:', transform.id);
            store.rollback(transform.id, -1);
          }

          return remote.requestQueue.skip();
        }
      },

      blocking: true
    });
  }
};
