import JSONAPISource from '@orbit/jsonapi';
import Orbit from '@orbit/data';
import fetch from 'fetch';

export default {
  create(injections = {}) {
    // Use `fetch` implementation from `ember-fetch`
    Orbit.fetch = fetch;

    injections.name = 'remote';

    return new JSONAPISource(injections);
  }
};
