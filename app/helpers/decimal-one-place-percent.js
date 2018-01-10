import Ember from 'ember';
import { decimalOnePlacePercent } from '../utils/number-formatters';

export function decimalPlacePercent([number, formatConfig]) {
  return decimalOnePlacePercent(number, formatConfig);
}

export default Ember.Helper.helper(decimalPlacePercent);
