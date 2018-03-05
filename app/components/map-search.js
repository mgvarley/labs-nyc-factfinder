import Ember from 'ember';
import fetch from 'fetch';
import { computed } from 'ember-decorators/object'; // eslint-disable-line
import { task, timeout } from 'ember-concurrency';
import bbox from 'npm:@turf/bbox';
import getBuffer from 'npm:@turf/buffer';
import Environment from '../config/environment';
import trackEvent from '../utils/track-event'; // eslint-disable-line

const { isEmpty, inject: { service } } = Ember;
const { SupportServiceHost } = Environment;

const DEBOUNCE_MS = 100;

export default Ember.Component.extend({
  classNames: ['search hide-for-print'],
  searchTerms: '',
  transitionTo: null,
  selected: 0,
  selection: service(),
  focused: false,

  @computed('searchTerms')
  results(searchTerms) {
    const rawResults = this.get('debouncedResults').perform(searchTerms);
    return rawResults;
  },

  debouncedResults: task(function* (searchTerms) {
    if (searchTerms.length < 3) this.cancel();
    yield timeout(DEBOUNCE_MS);
    const URL = `${SupportServiceHost}/search?q=${searchTerms}`;

    this.get('metrics').trackEvent(
      'GoogleAnalytics',
      {
        eventCategory: 'Search',
        eventAction: 'Received Results for Search Terms',
        eventLabel: searchTerms,
      },
    );

    return yield fetch(URL)
      .then(data => data.json())
      .then(json => json.map((result, index) => {
        const newResult = result;
        newResult.id = index;
        return result;
      }))
      .then((resultList) => {
        if (isEmpty(resultList)) {
          this.get('metrics').trackEvent(
            'GoogleAnalytics',
            {
              eventCategory: 'Search',
              eventAction: 'No results found for search terms',
              eventLabel: searchTerms,
            },
          );
        }
        return resultList;
      });
  }).keepLatest(),

  @computed('results.value')
  resultsCount(results) {
    if (results) return results.length;
    return 0;
  },

  keyPress(event) {
    const selected = this.get('selected');
    const { keyCode } = event;

    // enter
    if (keyCode === 13) {
      const results = this.get('results.value');
      if (results) {
        const selectedResult = results.objectAt(selected);
        this.send('goTo', selectedResult);
      }
    }
  },

  keyUp(event) {
    const selected = this.get('selected');
    const resultsCount = this.get('resultsCount');
    const { keyCode } = event;

    const incSelected = () => { this.set('selected', selected + 1); };
    const decSelected = () => { this.set('selected', selected - 1); };

    if ([38, 40, 27].includes(keyCode)) {
      const results = this.get('results.value');

      // up
      if (keyCode === 38) {
        if (results) {
          if (selected > 0) decSelected();
        }
      }

      // down
      if (keyCode === 40) {
        if (results) {
          if (selected < resultsCount - 1) incSelected();
        }
      }

      // down
      if (keyCode === 27) {
        this.set('searchTerms', '');
      }
    }
  },

  // adds a buffer to the geojson feature you pass in, then fits bounds to it
  fitBounds(feature, buffer = 0) {
    const map = this.get('selection').currentMapInstance;
    map.fitBounds(bbox(getBuffer(feature, buffer, { units: 'kilometers' })));
  },

  actions: {
    clear() {
      this.set('searchTerms', '');

      const selection = this.get('selection');
      selection.set('searchResultFeature', null);
    },

    @trackEvent('Map Search', 'Clicked result', 'searchTerms')
    goTo(result) {
      this.$('.map-search-input').blur();

      this.setProperties({
        selected: 0,
        focused: false,
      });

      const selection = this.get('selection');
      const map = selection.currentMapInstance;

      this.set('searchTerms', '');

      if (result.type === 'tract') {
        selection.set('searchResultFeature', result.feature);
        this.set('searchTerms', result.feature.properties.fips);
        this.fitBounds(result.feature, 1.2);
      }

      if (result.type === 'block') {
        selection.set('searchResultFeature', result.feature);
        this.set('searchTerms', result.feature.properties.fips);
        this.fitBounds(result.feature, 0.5);
      }
      //
      if (result.type === 'nta') {
        selection.set('searchResultFeature', result.feature);
        this.set('searchTerms', result.feature.properties.ntacode);
        this.fitBounds(result.feature, 3);
      }

      if (result.type === 'puma') {
        selection.set('searchResultFeature', result.feature);
        this.set('searchTerms', result.feature.properties.puma);
        this.fitBounds(result.feature, 3);
      }

      if (result.type === 'address') {
        const center = result.coordinates;
        selection.set('currentAddress', center);

        this.set('searchTerms', result.label);
        this.transitionTo('index');

        if (map) {
          map.flyTo({
            center,
            zoom: 15,
          });
        }
      }

      if (result.type === 'special-purpose-district') {
        this.set('searchTerms', result.sdname);
        this.transitionTo('special-purpose-district', result.cartodb_id);
      }
    },

    @trackEvent('Search', 'Focused In', 'searchTerms')
    handleFocusIn() {
      this.set('focused', true);
    },

    @trackEvent('Search', 'Focused Out', 'searchTerms')
    handleFocusOut() {
      this.set('focused', false);
    },
  },
});
