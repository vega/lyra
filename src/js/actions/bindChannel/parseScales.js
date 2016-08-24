'use strict';

var dl = require('datalib'),
    imutils = require('../../util/immutable-utils'),
    getIn = imutils.getIn,
    getInVis = imutils.getInVis,
    Scale = require('../../store/factory/Scale'),
    addScale = require('../scaleActions').addScale,
    addScaleToGroup = require('./helperActions').addScaleToGroup,
    computeLayout = require('./computeLayout');

var REF_CELLW = {data: 'layout', field: 'cellWidth'},
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
module.exports = function(dispatch, state, parsed) {
  var map  = parsed.map.scales,
      mark = parsed.mark,
      channel  = parsed.channel,
      markType = parsed.markType,
      prev = getInVis(state, 'scales.' + map[channel]),
      scaleId = prev && prev.get('_id'),
      scales  = parsed.output.marks[0].scales,
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

  // If no previous scale exists for this channel on this mark, try to find
  // a matching scale in Lyra.
  if (!prev) {
    getInVis(state, 'scales').valueSeq().forEach(function(scale) {
      if (equals(state, markType, def, scale)) {
        prev = scale;
        scaleId = scale.get('_id');
        return false;
      }
    });
  }

  // If no previous or matching scale exists, or if there's a mismatch in
  // definitions, dispatch actions to construct a new scale.
  if (!prev || !equals(state, markType, def, prev)) {
    def = createScale(dispatch, parsed, def);
    scaleId = def.id;

    // Ordinal-band scales can affect the layout. Call layout computation here
    // as (1) we only want to do this for new scales and (2) the scale doesn't
    // yet exist in the store, so we must pass it in manually.
    computeLayout(dispatch, state, parsed, def.props);
  }

  map[channel] = scaleId;
  dispatch(addScaleToGroup(scaleId, mark.get('_parent')));

  // leaves domain in scales spec the same way it was found
  console.log('parseSales:var:parsed: ', parsed);
};

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
  var bindChannel = require('./'),
      range  = def.rangeMin || def.rangeMax;

  if (def.name === 'x' || range === bindChannel.CELLW || dl.equal(range, REF_CELLW)) {
    def.range = 'width';
  } else if (def.name === 'y' || range === bindChannel.CELLH || dl.equal(range, REF_CELLH)) {
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
 * @returns {boolean} Returns true or false based on if the given Lyra scale
 * matches the parsed Vega definition.
 */
function equals(state, markType, def, scale) {
  if (scale.get('type') !== def.type) {
    return false;
  }

  var points = usesPoints(def.type, markType);
  if (!!scale.get('points') !== points) {
    return false;
  }

  if (scale.get('range') !== def.range) {
    return false;
  }

  var field = getIn(scale, '_domain.0.field');
  if (field !== def.domain.field) {
    return false;
  }

  return true;
}

function createScale(dispatch, parsed, def) {
  var map = parsed.map,
      markType = parsed.markType,
      points = usesPoints(def.type, markType),
      newScale = Scale(def.name, def.type, undefined, def.range),
      domain = def.domain;

  if (dl.isArray(domain)) { // Literal domain values
    newScale.domain = domain;
  } else if (dl.isObject(domain) && domain.data) { // Domain is a single DataRef
    newScale._domain = [{data: map.data[domain.data], field: domain.field}];
  }

  newScale.nice = def.nice;
  newScale.round = def.round;
  newScale.zero = def.zero;
  newScale.points = points;
  if (points) {
    newScale.padding = def.padding;
  }

  var action = addScale(newScale);
  return (dispatch(action), action);
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
function usesPoints(scaleType, markType) {
  return scaleType === 'ordinal' && markType !== 'rect';
}
