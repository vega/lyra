import {groupByActionTypes} from 'redux-undo';
import {getType} from 'typesafe-actions';
import {baseAddDataset} from '../actions/datasetActions';
import {updateGuideProperty} from '../actions/guideActions';
import {baseSetSignal} from '../actions/signalActions';

export const batchGroupBy = {
  _group: [],
  start() {
    return this._group.push(Date.now());
  },
  end() {
    return this._group.pop();
  },
  init(rawActions) {
    const defaultGroupBy = groupByActionTypes(rawActions)
    return (action) => this._group.length ? this._group.join('|') : defaultGroupBy(action)
  }
};

export default {
  limit: 15,
  filter: function(action) {
    return action.type !== getType(baseAddDataset);
  },
  groupBy: batchGroupBy.init([getType(baseSetSignal), getType(updateGuideProperty)])
};
