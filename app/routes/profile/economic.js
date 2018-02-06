import Ember from 'ember';
import Downloadable from '../../mixins/downloadable';

const { service } = Ember.inject;

export default Ember.Route.extend(Downloadable, {
  selection: service(),

  model(params, { queryParams: { comparator = '0' }, params: { profile: { id: selectionId } } }) {
    return this.store.query(
      'row',
      { selectionId, comparator, type: 'economic' },
    ).then(
      rows => rows.toArray(),
    );
  },
});
