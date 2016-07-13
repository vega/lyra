'use strict';

var dl = require('datalib'),
    merge = require('lodash.merge'),
    addGuide = require('../guideActions').addGuide,
    actions = require('./helperActions'),
    addAxisToGroup = actions.addAxisToGroup,
    addLegendToGroup = actions.addLegendToGroup,
    Guide = require('../../store/factory/Guide'),
    getInVis = require('../../util/immutable-utils').getInVis;

var TYPES = Guide.GTYPES,
    CTYPE = {
      x: TYPES.AXIS, y: TYPES.AXIS,
      color: TYPES.LEGEND, size: TYPES.LEGEND, shape: TYPES.LEGEND
    };

var SWAP_ORIENT = {
  left: 'right', right: 'left',
  top: 'bottom', bottom: 'top'
};

/**
 * Parses the guide definition in the resultant Vega specification to determine
 * how to update the Lyra redux store.
 *
 * @param {Function} dispatch  Redux dispatch function.
 * @param {ImmutableMap} state Redux store.
 * @param {Object} parsed      An object containing the parsed and output Vega
 * specifications as well as a mapping of output spec names to Lyra IDs.
 * @returns {void}
 */
module.exports = function(dispatch, state, parsed) {
  var channel = parsed.channel,
      map = parsed.map,
      guideType = CTYPE[channel],
      scaleId = map.scales[channel],
      group = parsed.output.marks[0];

  if (!guideType || !scaleId) {
    return;
  }

  if (guideType === TYPES.AXIS) {
    findOrCreateAxis(dispatch, state, parsed, scaleId, group.axes);
  } else {
    findOrCreateLegend(dispatch, state, parsed, scaleId, group.legends);
  }
};

/**
 * Attempts to find an axis for the given scale. If one is not found, and the
 * enclosing group does not already have two axes of the same type (i.e., two
 * x-axes or two y-axes), a new Lyra axis guide is constructed.
 *
 * @param {Function} dispatch  Redux dispatch function.
 * @param {ImmutableMap} state Redux store.
 * @param {Object} parsed      An object containing the parsed and output Vega
 * specifications as well as a mapping of output spec names to Lyra IDs.
 * @param  {number}  scaleId The ID of the Lyra scale the axis should be of.
 * @param  {Object} defs  All parsed Vega axis definitions.
 * @returns {void}
 */
function findOrCreateAxis(dispatch, state, parsed, scaleId, defs) {
  var map = parsed.map,
      mark  = parsed.mark,
      parentId = mark.get('_parent'),
      axes = getInVis(state, 'marks.' + parentId).get('axes'),
      def, count = 0, foundAxis = false;

  // First, find an def and then iterate through axes for the current group
  // to see if an axis exists for this scale or if we have room to add one more.
  def = defs.find(function(axisDef) {
    return map.scales[axisDef.scale] === scaleId;
  });

  axes.valueSeq().forEach(function(axisId) {
    var axis = getInVis(state, 'guides.' + axisId);
    if (axis.get('type') === def.type) {
      ++count;
    }

    if (axis.get('scale') === scaleId) {
      foundAxis = true;
      return false; // Early exit.
    }

    // TODO: If we're here, the scales don't match. But, we might have two
    // ordinal scales only differing by "points," so check the domains.
  });


  if (foundAxis) {
    return;
  }

  if (count < 2) {
    var axis = Guide(TYPES.AXIS, def.type, scaleId);
    axis.title = def.title;
    axis.layer = def.layer;
    axis.grid = def.grid;
    axis.orient = def.orient || axis.orient;
    if (count === 1) {
      axis.orient = SWAP_ORIENT[axis.orient];
    }
    merge(axis.properties, def.properties);
    dispatch(axis = addGuide(axis));
    dispatch(addAxisToGroup(axis.id, parentId));
  }
}

/**
 * Attempts to find a legend for the given scale. If one is not found, a new
 * Lyra legend guide is constructed.
 *
 * @param {Function} dispatch  Redux dispatch function.
 * @param {ImmutableMap} state Redux store.
 * @param {Object} parsed      An object containing the parsed and output Vega
 * specifications as well as a mapping of output spec names to Lyra IDs.
 * @param  {number}  scaleId The ID of the Lyra scale the legend should be of.
 * @param  {Object} defs  All parsed Vega legend definitions.
 * @returns {void}
 */
function findOrCreateLegend(dispatch, state, parsed, scaleId, defs) {
  var map = parsed.map,
      mark = parsed.mark,
      property = parsed.property,
      parentId = mark.get('_parent'),
      legends = getInVis(state, 'marks.' + parentId).get('legends'),
      def, foundLegend = false;

  def = defs.find(function(legendDef) {
    return map.scale[legendDef[property]] === scaleId;
  });

  legends.valueSeq().forEach(function(legendId) {
    var legend = getInVis(state, 'guides.' + legendId);
    foundLegend = foundLegend || legend.get(property) === scaleId;
  });

  if (!foundLegend) {
    var legend = Guide(TYPES.LEGEND, property, scaleId);
    legend.title = def.title;
    dl.extend(legend.properties, def.properties);
    dispatch(legend = addGuide(legend));
    dispatch(addLegendToGroup(legend.id, parentId));
  }
}
