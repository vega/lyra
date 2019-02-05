'use strict';

const counter = require('../util/counter');
const getInVis = require('../util/immutable-utils').getInVis;

import {AssertionError} from 'assert';
import {Dispatch} from 'redux';
import {createStandardAction} from 'typesafe-actions';
import {Datum} from 'vega-typings/types';
import {State} from '../store'
import {Dataset, DatasetRecord, Schema, SourceDatasetRecord} from '../store/factory/Dataset';
import {LyraAggregateTransform, PipelineRecord} from '../store/factory/Pipeline';
import * as dsUtil from '../util/dataset-utils';
import {addDataset} from './datasetActions';

/**
 * Action creator to add a new Pipeline in the store. A new pipeline requires
 * a new source dataset. Thus, we need to dispatch multiple actions.
 *
 * @param {Object} pipeline - The properties of the pipeline.
 * @param {Object} ds - The properties of the dataset.
 * @param {Array} values - A JSON array of parsed values.
 * @returns {Function} An async action function
 */
export const addPipeline = (pipeline: PipelineRecord, ds: DatasetRecord, values: Datum[]) => {
  return function(dispatch: Dispatch) {
    const pid = pipeline._id || counter.global();
    const newDs = addDataset(ds.merge({
      name: pipeline.name + '_source',
      _parent: pid
    }));

    dispatch(newDs);
    dispatch({
      type: 'ADD_PIPELINE',
      meta: pid,
      payload: pipeline.merge({_id: pid, _source: newDs.payload._id})
    });

    if ((newDs.payload as SourceDatasetRecord).source !== undefined) {
      dsUtil.init(newDs.payload as SourceDatasetRecord, values);
    } else {
      throw new AssertionError({message: 'old code assumed source dataset'});
    }
  };
}

/**
 * Action creator to aggregate a pipeline based on the given transform
 * definition. The action creator dispatches actions to create a new aggregated
 * dataset, and an action to associate this new dataset with the pipeline.
 *
 * @param   {number} id        The ID of the pipeline to aggregate
 * @param   {Object} aggregate A Vega aggregate transform definition.
 * @returns {Function}         An async action function.
 */
export const aggregatePipeline = (id: number, aggregate: LyraAggregateTransform) => {
  return function(dispatch, getState) {
    const state: State = getState();
    const pipeline: PipelineRecord = getInVis(state, 'pipelines.' + id);
    const srcId = pipeline.get('_source');
    const srcSchema: Schema = getInVis(state, 'datasets.' + srcId + '._schema').toJS();
    const schema = dsUtil.aggregateSchema(srcSchema, aggregate);
    const key = (aggregate.groupby as string[]).join('|'); // TODO: vega 2 aggregate.groupby is string[]

    const ds = addDataset(
      Dataset({
        name: pipeline.get('name') + '_groupby_' + key,
        source: srcId,
        transform: [aggregate],
        _schema: schema,
        _parent: id
      })
    );

    dispatch(ds);
    dispatch({
      type: 'AGGREGATE_PIPELINE',
      id: id,
      dsId: aggregate._id = ds.payload._id,
      key: key
    });
  };
}

export const updatePipelineProperty = createStandardAction('UPDATE_PIPELINE_PROPERTY')<{property: any, value: any}, number>();
