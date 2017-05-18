export function initialize(application) {
  application.inject('data-source', 'bucket', 'data-bucket:main');
  application.inject('data-key-map:main', 'bucket', 'data-bucket:main');
}

export default {
  name: 'orbit',
  initialize
};
