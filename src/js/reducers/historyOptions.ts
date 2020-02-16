import {groupByActionTypes} from 'redux-undo';
import {getType} from 'typesafe-actions';
import {addDataset} from '../actions/datasetActions';
import {updateGuideProperty} from '../actions/guideActions';
import {setSignal} from '../actions/signalActions';
import {signalNames} from '../store/factory/Signal';

export const batchGroupBy = {
  _group: 0,
  start: () => ++this._group,
  end: () => --this._group,
  init(rawActions) {
    const defaultGroupBy = groupByActionTypes(rawActions)
    return (action) => this._group || defaultGroupBy(action)
  }
};

export default {
  limit: 15,
  filter: function(action) {
    return action.type !== getType(addDataset) &&
      (action.type !== getType(setSignal) ||
        Object.values(signalNames).indexOf((action as any).meta) < 0);
  },
  groupBy: batchGroupBy.init([getType(setSignal), getType(updateGuideProperty)])
};
