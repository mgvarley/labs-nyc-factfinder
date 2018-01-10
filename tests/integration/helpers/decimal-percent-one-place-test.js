
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('decimal-percent-one-place', 'helper:decimal-percent-one-place', {
  integration: true
});

// Replace this with your real tests.
test('it renders', function(assert) {
  this.set('inputValue', '1234');

  this.render(hbs`{{decimal-percent-one-place inputValue}}`);

  assert.equal(this.$().text().trim(), '1234');
});

