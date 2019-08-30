import {Dispatch} from 'redux';
import {getCounts} from '../../ctrl/export';
import {State} from '../../store';
import {deleteDataset} from '../datasetActions';
import {deleteScale} from '../scaleActions';

const getInVis = require('../../util/immutable-utils').getInVis;

export default function cleanupUnused(dispatch: Dispatch, state: State) {
  // First, clean up unused scales. We do scales first, to ensure that any
  // unused scales do not prevent upstream datasets from being cleaned.
  const scales = getCounts(true).scales;
  for (const key in scales) {
    if (scales[key].markTotal === 0) {
      dispatch(deleteScale(null, +key));
    }
  }

  // Then, clean up unused datasets.
  const data = getCounts(true).data;
  for (const key in data) {
    if (data[key].total === 0) {
      const plId = getInVis(state, `datasets.${key}._parent`);
      if (getInVis(state, `pipelines.${plId}._source`) !== +key) {
        dispatch(deleteDataset(+key, plId));
      }
    }
  }
}
