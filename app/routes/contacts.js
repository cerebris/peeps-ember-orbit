import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    return this.store.liveQuery(q => q.findRecords('contact').sort('lastName', 'firstName'), {
      label: 'Find all contacts',
      sources: {
        remote: {
          include: ['phone-numbers']
        }
      }
    });
  }
});
