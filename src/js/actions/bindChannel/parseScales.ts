import {extend, isArray} from 'vega';
import {isDataRefDomain, isSignalRef} from 'vega-lite/build/src/vega.schema';
import {State} from '../../store';
import {RangeScale, Scale, ScaleRecord} from '../../store/factory/Scale';
import {addScale, updateScaleProperty} from '../scaleActions';
import {addScaleToGroup} from './helperActions';
import {CompiledBinding} from './index';
import {assignId} from '../../util/counter';
import {ThunkDispatch} from 'redux-thunk';
import {MarkRecord} from '../../store/factory/Mark';

const imutils = require('../../util/immutable-utils'),
  getIn = imutils.getIn,
  getInVis = imutils.getInVis;

/**
 * Parse the scale definitions in the resultant Vega specification to determine
 * if new Lyra scales should be constructed, or existing ones updated.
 * @todo Why do we not pass `channel` so that only scales for the bound channel
 * are evaluated?
 *
 * @param {Function} dispatch  Redux dispatch function.
 * @param {ImmutableMap} state Redux store.
 * @param {Object} parsed      An object containing the parsed and output Vega
 * specifications as well as a mapping of output spec names to Lyra IDs.
 * @returns {void}
 */
export default function parseScales(dispatch: ThunkDispatch<State, any, any>, state: State, parsed: CompiledBinding) {
  const map = parsed.map.scales,
    dsMap = parsed.map.data,
    mark = parsed.mark,
    channel = parsed.channel;

  let prev: ScaleRecord = getInVis(state, 'scales.' + map[channel]),
    scaleId = prev && prev._id,
    scales = parsed.output.scales as RangeScale[];

  if (!scales) {
    return;
  }

  // For a single-layer VL spec, scales are defined within the first group
  // and are named for the channel they encode.
  scales = scales.filter(s => s.name === channel);

  if (scales.length !== 1) {
    console.warn(scales.length + ' scales found for ' + channel);
    return;
  }

  const def = parse(scales[0]);

  // First, try to find a matching scale.
  // TODO: Reuse rect spatial scale if available.
  if (!prev || !equals(state, def, prev, dsMap)) {
    getInVis(state, 'scales')
      .valueSeq()
      .forEach(function(scale: ScaleRecord) {
        if (equals(state, def, scale, dsMap)) {
          prev = scale;
          scaleId = scale._id;
          return false;
        }
      });
  }

  // check the scale of other marks in the visualization. if we are
  // layering marks (dropping a field to the same channel where another
  // mark already has a scale) then union the fields in a single scale.
  const otherMarksInGroup = state.getIn(['vis', 'present', 'marks']).valueSeq().filter(x => x.type !== 'group' && x.type !== 'scene' && x._id !== mark._id && x._parent === mark._parent);
  let didUnion = false;
  otherMarksInGroup.forEach((mark: MarkRecord) => {
    let markScale;
    if (channel === 'x') {
      markScale = (mark.encode?.update?.x as any).scale;
    }
    else if (channel === 'y') {
      markScale = (mark.encode?.update?.y as any).scale;
    }
    if (markScale) {
      const scale = state.getIn(['vis', 'present', 'scales', String(markScale)]);
      prev = scale;
      scaleId = scale._id;

      const tempScale = createScale(parsed, def);
      // union the domains
      const unionedDomain = scale._domain.concat(tempScale._domain).filter((value, idx, arr) => arr.findIndex( t => (t.field === value.field)) === idx);
      dispatch(updateScaleProperty({ property: '_domain', value: unionedDomain }, scale._id))
      didUnion = true;
    }
  });
  // If no previous or matching scale exists, or if there's a mismatch in
  // definitions, dispatch actions to construct a new scale.
  if (!didUnion && (!prev || !equals(state, def, prev, dsMap))) {
    scaleId = assignId(dispatch, state);
    const scale = createScale(parsed, def).merge({_id: scaleId});

    dispatch(addScale(scale));

    // Ordinal-band scales can affect the layout. Call layout computation here
    // as (1) we only want to do this for new scales and (2) the scale doesn't
    // yet exist in the store, so we must pass it in manually.
    // computeLayout(dispatch, state, parsed, def.props);
  }

  map[channel] = scaleId;
  dispatch(addScaleToGroup(scaleId, mark._parent));
}

/**
 * Parse a Vega scale definition (produced by Vega-Lite) and return an object
 * that mimics Lyra's scale definition. Note: this does not construct a Lyra
 * scale, but instead produces an object to compare existing scales against. We
 * map from Vega scale DataRefs to Lyra IDs, and account for Vega-Lite
 * idiosyncracies such as hardcoded ranges and band sizes. We do not parse the
 * domains to Lyra primitives in this function because it is expensive, and
 * not needed to determine equality with existing Lyra scales.
 *
 * @private
 * @param {Object} def A Vega scale definition.
 * @returns {Object} An object that mimics a Lyra Scale primitive.
 */
function parse(def: RangeScale) {
  const range = def.range;

  if (def.name === 'x' || (isArray(range) && range.find(r => isSignalRef(r) && r.signal === 'width'))) {
    def.range = 'width';
  } else if (def.name === 'y' || (isArray(range) && range.find(r => isSignalRef(r) && r.signal === 'height'))) {
    def.range = 'height';
  }

  return def;
}

/**
 * Tests whether an existing Lyra scale is equal to a parsed Vega scale
 * definition. Accounts for idiosyncracies with how Vega-Lite outputs scales.
 * For example, Vega-Lite always produces ordinal "point" scales but Lyra
 * prefers to use ordinal "band" scales for rect marks to simplify encoding
 * specification. TODO: revisit?
 *
 * @private
 * @param  {ImmutableMap} state Redux store.
 * @param  {string} markType    The Vega type of the mark.
 * @param  {Object} def   A parsed Vega scale definition.
 * @param  {Scale}  scale An existing Lyra scale.
 * @param  {Object} dsMap A mapping of data source names to IDs
 * @returns {boolean} Returns true or false based on if the given Lyra scale
 * matches the parsed Vega definition.
 */
function equals(state: State, def: RangeScale, scale: ScaleRecord, dsMap): boolean {
  if (scale.type !== def.type) {
    return false;
  }

  if (JSON.stringify(scale.range) !== JSON.stringify(def.range)) {
    return false;
  }

  if(isDataRefDomain(def.domain) && scale._domain) {
    const domain = scale._domain[0];
    if (domain.field !== def.domain.field) {
      return false;
    }

    const pipeline = getInVis(state, `datasets.${domain.data}._parent`);
    if (pipeline !== getInVis(state, `datasets.${dsMap[def.domain.data]}._parent`)) {
      return false;
    }
  }

  return true;
}

function createScale(parsed: CompiledBinding, def: RangeScale): ScaleRecord {
  const {domain, ...rest} = def,
    props = isDataRefDomain(domain)
      ? extend({}, rest, {_domain: [{data: parsed.map.data[domain.data], field: domain.field}]})
      : def;

  return Scale(props)
}
