'use strict';
import {Scale} from '../../store/factory/Scale';
import {addScale} from '../scaleActions';
import {addScaleToGroup} from './helperActions';
import {computeLayout} from './computeLayout';
import {Dispatch} from 'redux';
import {State} from '../../store';
import {CELLH, CELLW} from './index';

const dl = require('datalib'),
  imutils = require('../../util/immutable-utils'),
  getIn = imutils.getIn,
  getInVis = imutils.getInVis;

const REF_CELLW = {data: 'layout', field: 'cellWidth'},
  REF_CELLH = {data: 'layout', field: 'cellHeight'};

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
export function parseScales(dispatch: Dispatch, state: State, parsed) {
  const map = parsed.map.scales,
    dsMap = parsed.map.data,
    mark = parsed.mark,
    channel = parsed.channel,
    markType = parsed.markType;
  let prev = getInVis(state, 'scales.' + map[channel]),
    scaleId = prev && prev.get('_id'),
    scales = parsed.output.marks[0].scales,
    def;

  if (!scales) {
    return;
  }

  // For a single-layer VL spec, scales are defined within the first group
  // and are named for the channel they encode.
  scales = scales.filter(function(scale) {
    return scale.name === channel;
  });

  if (scales.length !== 1) {
    console.warn(scales.length + ' scales found for ' + channel);
    return;
  }

  def = parse(scales[0]);

  // First, try to find a matching scale.
  // TODO: Reuse rect spatial scale if available.
  if (!prev || !equals(state, markType, def, prev, dsMap)) {
    getInVis(state, 'scales')
      .valueSeq()
      .forEach(function(scale) {
        if (equals(state, markType, def, scale, dsMap)) {
          prev = scale;
          scaleId = scale.get('_id');
          return false;
        }
      });
  }

  // If no previous or matching scale exists, or if there's a mismatch in
  // definitions, dispatch actions to construct a new scale.
  if (!prev || !equals(state, markType, def, prev, dsMap)) {
    def = createScale(dispatch, parsed, def);
    scaleId = def.id;

    // Ordinal-band scales can affect the layout. Call layout computation here
    // as (1) we only want to do this for new scales and (2) the scale doesn't
    // yet exist in the store, so we must pass it in manually.
    computeLayout(dispatch, state, parsed, def.props);
  }

  map[channel] = scaleId;
  dispatch(addScaleToGroup(scaleId, mark.get('_parent')));
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
function parse(def) {
  const range = def.rangeMin || def.rangeMax;

  if (def.name === 'x' || range === CELLW || dl.equal(range, REF_CELLW)) {
    def.range = 'width';
  } else if (def.name === 'y' || range === CELLH || dl.equal(range, REF_CELLH)) {
    def.range = 'height';
  }

  delete def.rangeMin;
  delete def.rangeMax;
  delete def.bandSize;
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
function equals(state: State, markType: string, def, scale, dsMap): boolean {
  if (scale.get('type') !== def.type) {
    return false;
  }

  var points = usesPoints(def.type, markType);
  if (!!scale.get('points') !== points) {
    return false;
  }

  let rng = scale.get('range');
  rng = rng.toJS ? rng.toJS() : rng;
  if (JSON.stringify(rng) !== JSON.stringify(def.range)) {
    return false;
  }

  const field = getIn(scale, '_domain.0.field');
  if (field !== def.domain.field) {
    return false;
  }

  const pipeline = getInVis(state, 'datasets.' + getIn(scale, '_domain.0.data') + '._parent');
  if (pipeline !== getInVis(state, 'datasets.' + dsMap[def.domain.data] + '._parent')) {
    return false;
  }

  return true;
}

function createScale(dispatch: Dispatch, parsed, def) {
  const map = parsed.map,
    markType = parsed.markType,
    points: boolean = usesPoints(def.type, markType),
    domain = def.domain;
  let newScale = Scale({name: def.name, type: def.type, range: def.range});

  if (dl.isArray(domain)) {
    // Literal domain values
    newScale = newScale.merge({domain: domain});
  } else if (dl.isObject(domain) && domain.data) {
    // Domain is a single DataRef
    newScale = newScale.merge({_domain: [{data: map.data[domain.data], field: domain.field}] as any}); // TODO(rn) figure out what type this should be
  }

  newScale = newScale.merge({
    nice: def.nice,
    round: def.round,
    zero: def.zero
    // points: points
  });

  // if (points) {
  //   newScale.padding = def.padding;
  // }

  const action = addScale(newScale);
  return dispatch(action), action;
}

/**
 * Helper function to determine how to set the `points` property of a Vega
 * scale, depending on the mark to which that scale is applied
 *
 * @private
 * @param {string} scaleType  The type of scale
 * @param {string} markType   The type of mark
 * @returns {boolean} The value of the "points" property of the Vega scale
 */
function usesPoints(scaleType: string, markType: string): boolean {
  return scaleType === 'ordinal' && markType !== 'rect';
}
