import Ember from 'ember';
import { computed } from 'ember-decorators/object';
import { decimalOnePlace } from '../utils/number-formatters';

function differenceInsignificance(value, moe) {
  const insignificant = moe >= Math.abs(parseFloat(value));
  return insignificant;
}

export function decimalFormat(number, decimal) { // for number >=0
  if ((number > 0) || (number === 0)) {
    let x;
    if (decimal === 1) {
      x = number.toFixed(1);
    } else if (decimal === 2) {
      x = number.toFixed(2);
    } else {
      x = number.toFixed(0);
    }
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  return null;
}

export function decimalFormatAll(number, decimal, isChange) { // for all numbers
  let x;
  if (isNaN(number)) {
    return null;
  }
  if (decimal === 1) {
    x = number.toFixed(1);
  } else if (decimal === 2) {
    x = number.toFixed(2);
  } else {
    x = number.toFixed(0);
  }

  let string = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // prepend + sign if isChange is true
  if ((x > 0) && isChange)string = `+${string}`;
  return string;
}


export function decimalOnePlacePercent(number, isChange) {
  // number = parseFloat(number);
  if (isNaN(number)) {
    return null;
  }
  let string = (number * 100).toFixed(1);

  // prepend + sign if isChange is true
  if ((number > 0) && isChange)string = `+${string}`;
  return `${string}%`;
}

export default Ember.Component.extend({
  mode: 'current',
  reliability: false,
  comparison: true,

  tagName: 'tr',
  classNameBindings: ['getClassNames'],

  @computed('rowconfig')
  getClassNames(rowconfig) {
    const classes = [];

    if (rowconfig.highlight) {
      classes.push('row-highlight');
    }

    if (rowconfig.indent) {
      classes.push(`row-indent-x${rowconfig.indent}`);
    }

    return classes.join(' ');
  },

  @computed('data2.sum', 'rowconfig')
  selectedEarlySum(sum, rowconfig) {
    // sum = parseFloat(sum);
    return decimalFormat(sum, rowconfig.decimal);
  },

  @computed('data2.m', 'rowconfig')
  selectedEarlySumM(m, rowconfig) {
    return decimalFormat(m, rowconfig.decimal);
  },

  @computed('data2.cv', 'rowconfig')
  selectedEarlySumCV(cv, rowconfig) {
    return decimalOnePlace(cv, rowconfig.decimal);
  },

  @computed('data2.sum', 'data2.percent')
  selectedEarlyPercent(sum, percent) {
    // sum = parseFloat(sum);
    // percent = parseFloat(percent);
    if (sum > 0) {
      return percent;
    }
    return null;
  },

  @computed('data2.sum', 'data2.percent_m')
  selectedEarlyPercentM(sum, percent_m) {
    // sum = parseFloat(sum);
    // percent_m = parseFloat(percent_m);
    if (sum > 0) {
      return percent_m;
    }
    return null;
  },

  @computed('data2.sum', 'data.sum', 'rowconfig')
  selectedCurrentSum(sum2, sum, rowconfig) {
    // sum2 = parseFloat(sum2);
    // sum = parseFloat(sum);
    if ((sum2 > 0) || (sum2 === 0)) {
      return decimalFormat(sum, rowconfig.decimal);
    }
    return null;
  },

  @computed('data.m', 'rowconfig')
  selectedCurrentSumM(m, rowconfig) {
    return decimalFormat(m, rowconfig.decimal);
  },

  @computed('data.cv', 'rowconfig')
  selectedCurrentSumCV(cv, rowconfig) {
    return decimalOnePlace(cv, rowconfig.decimal);
  },

  @computed('data2.sum', 'data.sum', 'data.percent')
  selectedCurrentPercent(sum2, sum, percent) {
    // sum2 = parseFloat(sum2);
    // sum = parseFloat(sum);
    // percent = parseFloat(percent);
    if ((sum2 > 0) || (sum2 === 0)) {
      if (sum > 0) {
        return percent;
      }
      return null;
    }
    return null;
  },

  @computed('data.sum', 'data.percent_m')
  selectedCurrentPercentM(sum, percent_m) {
    // sum = parseFloat(sum);
    // percent_m = parseFloat(percent_m);
    if (sum > 0) {
      return percent_m;
    }
    return null;
  },

  @computed('data2.sum', 'data.sum', 'rowconfig')
  change(sum2, sum, rowconfig) {
    // sum2 = parseFloat(sum2);
    // sum = parseFloat(sum);
    if (isNaN(sum2) || isNaN(sum)) {
      return null;
    }
    const difference = sum - sum2;
    return decimalFormatAll(difference, rowconfig.decimal, true);
  },

  @computed('data2.sum', 'data2.m', 'data.m', 'rowconfig')
  changeMOE(sum2, m2, m, rowconfig) {
    if ((sum2 > 0) || (sum2 === 0)) {
      if (isNaN(m2) || isNaN(m)) {
        return null;
      }
      const x = (((m2 / 1.645) * (m2 / 1.645))
      + ((m / 1.645) * (m / 1.645)));
      if ((x > 0) || (x === 0)) {
        const changeM = Math.sqrt(x);
        return decimalFormat(changeM, rowconfig.decimal);
      }
      return null;
    }
    return null;
  },

  @computed('data2.sum', 'data.sum')
  changePercent(sum2, sum) {
    // sum = parseFloat(sum);
    // sum2 = parseFloat(sum2);
    if (sum2 > 0) {
      const x = (sum - sum2) / sum2;
      return decimalOnePlacePercent(x, true);
    }
    return null;
  },

  @computed('data.sum', 'data2.sum', 'data.m', 'data2.m')
  changePercentMOE(sum, sum2, m, m2) {
    if (sum2 > 0) {
      const moe =
        Math.abs(sum / sum2) *
        Math.sqrt(
          (
            ((m / 1.645) ** 2) / (sum ** 2)
          ) +
          (
            ((m2 / 1.645) ** 2) / (sum2 ** 2)
          ),
        ) * 1.645;

      return decimalOnePlacePercent(moe);
    }
    return null;
  },

  @computed('selectedEarlyPercent', 'selectedCurrentPercent')
  changePercentagePoint(selectedEarlyPercent, selectedCurrentPercent) {
    return decimalOnePlace(selectedCurrentPercent - selectedEarlyPercent, true);
  },

  @computed('selectedEarlyPercentM', 'selectedCurrentPercentM')
  changePercentagePointMOE(selectedEarlyPercentM, selectedCurrentPercentM) {
    const divisor = 1.645;
    const sumOfSquares = (((parseFloat(selectedEarlyPercentM) / divisor) ** 2) + ((parseFloat(selectedCurrentPercentM) / divisor) ** 2));
    const difference = Math.sqrt(sumOfSquares);

    if (isNaN(parseFloat(selectedEarlyPercentM)) || isNaN(parseFloat(selectedCurrentPercentM))) {
      return null;
    }

    return difference.toFixed(1);
  },

  @computed('change', 'changeMOE')
  changeInsignificant(change, changeMOE) {
    return differenceInsignificance(change, changeMOE);
  },

  @computed('changePercent', 'changePercentMOE')
  changePercentInsignificant(changePercent, changePercentMOE) {
    return differenceInsignificance(changePercent, changePercentMOE);
  },

  @computed('changePercentagePoint', 'changePercentagePointMOE')
  changePercentagePointInsignificant(changePercentagePoint, changePercentagePointMOE) {
    return differenceInsignificance(changePercentagePoint, changePercentagePointMOE);
  },
});
