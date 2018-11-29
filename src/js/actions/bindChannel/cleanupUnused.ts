import {deleteDataset} from '../datasetActions';

const deleteScale = require('../scaleActions').deleteScale,
    getInVis = require('../../util/immutable-utils').getInVis;

module.exports = function(dispatch, state) {
  let exporter = require('../../ctrl/export'),
      key;

  // First, clean up unused scales. We do scales first, to ensure that any
  // unused scales do not prevent upstream datasets from being cleaned.
  const scales = exporter.counts(true).scales;
  for (key in scales) {
    if (scales[key].markTotal === 0) {
      dispatch(deleteScale(+key));
    }
  }

  // Then, clean up unused datasets.
  let data = exporter.counts(true).data,
      plId;
  for (key in data) {
    if (data[key].total === 0) {
      plId = getInVis(state, 'datasets.' + (key = +key) + '._parent');
      if (getInVis(state, 'pipelines.' + plId + '._source') !== key) {
        dispatch(deleteDataset(plId, key));
      }
    }
  }
};
