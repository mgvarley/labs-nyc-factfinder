import Ember from 'ember';
import trackEvent from '../utils/track-event'; // eslint-disable-line

export default Ember.Component.extend({
  tagName: '',
  data: [],
  filename: 'download',
  actions: {
    @trackEvent('Data', 'Downloaded CSV')
    handleDownload(format = 'csv') {
      const filename = this.get('filename');
      const profile = this.get('data')
        .map((row) => {
          const truncatedRow = row;
          delete truncatedRow.codingThresholds;
          delete truncatedRow.rowConfig;
          return truncatedRow;
        })
        .sortBy('dataset', 'profile', 'category').reverse();
      const columnNames = [Object.keys(profile.get('firstObject'))];
      const matrixValues = profile.map(row => Object.values(row));

      const data = []
        .concat(
          columnNames,
          matrixValues,
        );

      console.log(data);

      if (format === 'csv') {
        this.get('csv').export(data, { fileName: `${filename}.csv`, withSeparator: false });
      }
    },
  },
});
