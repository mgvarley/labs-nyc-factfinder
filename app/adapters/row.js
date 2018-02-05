import DS from 'ember-data';
import carto from '../utils/carto';
import generateProfileSQL from '../queries/profile';
import decennialProfile from '../queries/decennial-profile';
import Environment from '../config/environment';
import fetch from 'fetch';

const { SupportServiceHost } = Environment;

export default DS.JSONAPIAdapter.extend({
  query(store, modelType, query) {
    const { selectionId, comparator, type /*category*/ } = query;
    // let selectionSQL;
    // if (type === 'decennial') {
    //   selectionSQL = decennialProfile(geoids, category, comparator);
    // } else {
    //   selectionSQL = generateProfileSQL(geoids, comparator, type);
    // }

    // return carto.SQL(selectionSQL, 'json', 'post');
    return fetch(`${SupportServiceHost}/profile/${selectionId}/${type}?compare=${comparator}`)
      .then(blob => blob.json());
  },

  keyForAttribute(key) {
    return key;
  },
});
