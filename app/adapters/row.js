import DS from 'ember-data';
import fetch from 'fetch';
import Environment from '../config/environment';


const { SupportServiceHost } = Environment;

export default DS.JSONAPIAdapter.extend({
  query(store, modelType, query) {
    const { selectionId, comparator, type, category } = query;

    let url = `${SupportServiceHost}/profile/${selectionId}/${type}?compare=${comparator}`;

    if (type === 'decennial') {
      url = `${SupportServiceHost}/profile/${selectionId}/${type}/${category}?compare=${comparator}`;
    }

    return fetch(url)
      .then(blob => blob.json());
  },

  keyForAttribute(key) {
    return key;
  },
});
