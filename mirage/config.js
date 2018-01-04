import config from '../config/environment';
import SAMPLE_SUPPORT_SERVICE_RESPONSE from './sample-responses/support-service-1';
import SAMPLE_REPORT_DEMOGRAPHIC from './sample-responses/sample-report-demographic-1';

const { SupportServiceHost } = config;

export default function() {
  // These comments are here to help you get started. Feel free to delete them.

  /*
    Config (with defaults).

    Note: these only affect routes defined *after* them!
  */

  this.urlPrefix = SupportServiceHost;    // make this `http://localhost:8080`, for example, if your API is on a different server
  // this.namespace = '';    // make this `/api`, for example, if your API is namespaced
  // this.timing = 400;      // delay for each request, automatically set to 0 during testing

  this.get('selection/:id', () => {
    return SAMPLE_SUPPORT_SERVICE_RESPONSE;
  });

  this.post('https://planninglabs.carto.com/api/v2/sql', (schema, request) => {
    console.log(request);
    return SAMPLE_REPORT_DEMOGRAPHIC;
  });

  this.post('https://capture.trackjs.com/**', () => {
    return {};
  });

  /*
    Shorthand cheatsheet:

    this.get('/posts');
    this.post('/posts');
    this.get('/posts/:id');
    this.put('/posts/:id'); // or this.patch
    this.del('/posts/:id');

    http://www.ember-cli-mirage.com/docs/v0.3.x/shorthands/
  */
}
