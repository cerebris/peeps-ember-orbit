# peeps-ember-orbit

This simple contact manager demo app illustrates the usage of
[ember-orbit](https://github.com/orbitjs/ember-orbit) with multiple
source configurations and coordination strategies.

By default, this demo will work in both the "memory" and "memory + backup"
configurations.

If you'd like to try it out with one of the JSONAPI server configurations as
well, you'll need to install and run
[peeps-uuids](https://github.com/cerebris/peeps-uuids). Once you've started the
server locally (with `rails s`), start peeps-ember-orbit so that
requests are proxied to the server:

```
ember server --proxy http://127.0.0.1:3000
```

## Installation

* `git clone <repository-url>` this repository
* change into the new directory
* `npm install`

## Running / Development

* `ember server`
* Visit your app at [http://localhost:4200](http://localhost:4200).

Alternatively, to proxy to a Peeps server running locally on port 3000:

* `ember server --proxy http://127.0.0.1:3000`
* Visit your app at [http://localhost:4200](http://localhost:4200).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

Specify what it takes to deploy your app.

## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
