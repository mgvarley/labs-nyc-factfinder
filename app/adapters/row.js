import DS from 'ember-data';
import carto from '../utils/carto';
import generateProfileSQL from '../queries/profile';

export default DS.JSONAPIAdapter.extend({
  query(store, modelType, query) {
    const { geoids, comparator, type } = query;
    const selectionSQL = generateProfileSQL(geoids, comparator, type);

    return carto.SQL(selectionSQL, 'json', 'post');
  },

  keyForAttribute(key) {
    return key;
  },
});