const getInVis = require('../util/immutable-utils').getInVis;

import {Dispatch} from 'redux';
import {createStandardAction} from 'typesafe-actions';
import {Datum} from 'vega-typings/types';
import {State} from '../store'
import {Dataset, DatasetRecord, Schema} from '../store/factory/Dataset';
import {LyraAggregateTransform, HistoryRecord, History} from '../store/factory/History';
import * as dsUtil from '../util/dataset-utils';
import {addDataset} from './datasetActions';
import {selectHistory} from './inspectorActions';
import {assignId} from '../util/counter';
import {ThunkDispatch} from 'redux-thunk';

/**
 * Action creator to add a new History in the store. A new history requires
 * a new source dataset. Thus, we need to dispatch multiple actions.
 *
 * @param {Object} history - The properties of the history.
 * @param {Object} ds - The properties of the dataset.
 * @param {Array} values - A JSON array of parsed values.
 * @returns {Function} An async action function
 */
export function addHistory (history: HistoryRecord, ds: DatasetRecord, values: Datum[]) {
  return function(dispatch: ThunkDispatch<State, any, any>, getState) {
    const pid = history._id || assignId(dispatch, getState());
    const dsId = assignId(dispatch, getState());
    const newDs = ds.merge({
      _id: dsId,
      name: `${history.name}_source_${dsId}`,
      _parent: pid
    });

    dispatch(addDataset(newDs, values));
    dispatch(baseAddHistory(history.merge({_id: pid, _source: dsId}), pid));
    dispatch(selectHistory(pid));
  };
}

/**
 * Action creator to derive a history based on an existing dataset source.
 * A derived history shares an existing source dataset.
 *
 * @param {Object} historyId - The id of the history to derive.
 */
export function mergeHistory (historyId: number) {
  let test = function(dispatch, getState) {
    const state: State = getState();
    const history: HistoryRecord = state.getIn(['vis', 'present', 'history', String(historyId)]);
    const srcId = history._source;
    const srcSchema: Schema = state.getIn(['vis', 'present', 'datasets', String(srcId), '_schema']);

    const dsId = assignId(dispatch, getState());
    const pid = assignId(dispatch, getState());

    const ds = Dataset({
      _id: dsId,
      name: history.get('name') + '_derived_' + dsId,
      source: String(srcId),
      transform: [],
      _schema: srcSchema,
      _parent: pid
    });

    const newHistory = History({
      _id: pid,
      name: `${history.name}_derived`,
      _source: dsId
    });

    dispatch(baseAddHistory(newHistory, pid));
    dispatch(addDataset(ds, null));
    dispatch(selectHistory(pid));
  };

  return null;
}

/**
 * Action creator to aggregate a history based on the given transform
 * definition. The action creator dispatches actions to create a new aggregated
 * dataset, and an action to associate this new dataset with the history.
 *
 * @param   {number} id        The ID of the history to aggregate
 * @param   {Object} aggregate A Vega aggregate transform definition.
 * @returns {Function}         An async action function.
 */
export function aggregateHistory (id: number, aggregate: LyraAggregateTransform) {
  return function(dispatch, getState) {
    const state: State = getState();
    const history: HistoryRecord = state.getIn(['vis', 'present', 'history', String(id)]);
    const srcId = history._source;
    const srcSchema: Schema = state.getIn(['vis', 'present', 'datasets', String(srcId), '_schema']);
    const schema = dsUtil.aggregateSchema(srcSchema, aggregate);
    const key = (aggregate.groupby as string[]).join('|'); // TODO: vega 2 aggregate.groupby is string[]

    // check if an aggregate was added previously with an empty groupby
    // this happens when you drag the aggregate measure to a dropzone first
    const partialAggregateId = history._aggregates.get("");
    if (partialAggregateId) {
      const ds = Dataset({
        _id: partialAggregateId,
        name: history.get('name') + '_groupby_' + key,
        source: String(srcId),
        transform: [aggregate],
        _schema: schema,
        _parent: id
      });

      dispatch(addDataset(ds, null)); // overwrite the old dataset
      dispatch(baseAggregateHistory({ // delete the reference to the old, partial dataset
        dsId: undefined,
        key: ""
      }, id));
      dispatch(baseAggregateHistory({ // add a reference to the new dataset using the correct key
        dsId: aggregate._id = partialAggregateId,
        key: key
      }, id));
    }
    else {
      // this is the normal case
      const dsId = assignId(dispatch, getState());
      const ds = Dataset({
        _id: dsId,
        name: history.get('name') + '_groupby_' + key,
        source: String(srcId),
        transform: [aggregate],
        _schema: schema,
        _parent: id
      });

      dispatch(addDataset(ds, null));
      dispatch(baseAggregateHistory({
        dsId: aggregate._id = dsId,
        key: key
      }, id));
    }

  };
}

// action creators prefixed with "base" should only be called by their redux-thunk function wrappers - jzong
export const baseAddHistory = createStandardAction('ADD_HISTORY')<HistoryRecord, number>();
export const baseAddHistory = createStandardAction('ADD_HISTORY')<HistoryRecord, number>();
export const baseAggregateHistory = createStandardAction('AGGREGATE_HISTORY')<{dsId: number, key: string}, number>();
export const updateHistoryProperty = createStandardAction('UPDATE_HISTORY_PROPERTY')<{property: string, value: any}, number>();
