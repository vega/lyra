const getInVis = require('../../util/immutable-utils').getInVis;

import {AnyAction, Dispatch} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {Data} from 'vega';
import {CompiledBinding} from '.';
import {State} from '../../store';
import {LyraAggregateTransform} from '../../store/factory/Pipeline';
import {summarizeAggregate} from '../datasetActions';
import {aggregatePipeline} from '../pipelineActions';

/**
 * Parse the data source definitions in the resultant Vega specification.
 * For now, as we do not yet support transforms, we only add an entry to the
 * `map` to identify the data source named "source" as our backing Lyra
 * dataset.
 *
 * @param {Function} dispatch  Redux dispatch function.
 * @param {ImmutableMap} state Redux store.
 * @param {Object} parsed      An object containing the parsed and output Vega
 * specifications as well as a mapping of output spec names to Lyra IDs.
 * @param {number} dsId        The ID of the current mark's backing dataset.
 * @returns {void}
 */
export default function parseData(dispatch: Dispatch, state: State, parsed: CompiledBinding) {
  parsed.map.data['source_0'] = parsed.dsId;
  parsed.map.data['data_0'] = parsed.dsId;

  // In unit views, aggregate transforms get added to source dataset directly,
  // which may be named either data_0 or source_0 depending on the presence of transforms.
  const dataDef = parsed.output.data,
    data = dataDef.find(d => d.name === 'data_0') || dataDef.find(d => d.name === 'source_0');
  parseAggregate(dispatch, state, parsed, data);
};

function parseAggregate(dispatch: ThunkDispatch<State, null, AnyAction>, state: State, parsed: CompiledBinding, data: Data) {
  const aggregate = data.transform && data.transform.find(tx => tx.type === 'aggregate') as LyraAggregateTransform;
  if (!aggregate) {
    return;
  }

  const groupby = aggregate.groupby as string[];
  const keys  = groupby.join('|');
  const plId  = parsed.plId;
  let aggId = getInVis(state, 'pipelines.' + plId + '._aggregates.' + keys);

  if (!aggId) {
    // TODO: What about if a previous parsed.map.data.summary exists? How do
    // we derive a new agg DS to preserve transforms.
    dispatch(aggregatePipeline(plId, aggregate));
    aggId = aggregate._id;
  } else {
    dispatch(summarizeAggregate(aggregate, aggId));
  }

  parsed.map.data['source_0'] = aggId;
  parsed.map.data['data_0'] = aggId;
}
