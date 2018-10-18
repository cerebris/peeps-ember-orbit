import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import Route from '@ember/routing/route';

export default Route.extend({
  orbitConfiguration: service(),

  beforeModel() {
    // Initialize the default (or most recently used) configuration for this
    // application.
    //
    // NOTE: Most Orbit apps will have a single configuration that will be set
    // up synchronously in an instance initializer instead of through the more
    // involved `orbitConfiguration` service demo'd here. It would then only be
    // necessary to call `dataCoordinator.activate()` to activate the
    // coordinator service in this hook (and since activation is an async
    // process, a promise should be returned here).
    return get(this, 'orbitConfiguration').initialize();
  }
});
