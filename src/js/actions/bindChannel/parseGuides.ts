import {Guide, GuideType, AxisRecord, LegendRecord} from '../../store/factory/Guide';
import {addGuide} from '../guideActions';
import {Dispatch} from 'redux';
import {State} from '../../store';


const actions = require('./helperActions'),
  addAxisToGroup = actions.addAxisToGroup,
  addLegendToGroup = actions.addLegendToGroup,
  imutils = require('../../util/immutable-utils'),
  getIn = imutils.getIn,
  getInVis = imutils.getInVis;

const CTYPE = {
  x: GuideType.Axis, y: GuideType.Axis,
  color: GuideType.Legend, size: GuideType.Legend, shape: GuideType.Legend
};

const SWAP_ORIENT = {
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
export function parseGuides(dispatch : Dispatch, state : State, parsed) {
  const channel = parsed.channel,
      map = parsed.map,
      guideType = CTYPE[channel],
      scaleId = map.scales[channel],
      group = parsed.output.marks[0];

  if (!guideType || !scaleId) {
    return;
  }

  if (guideType === GuideType.Axis) {
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
function findOrCreateAxis(dispatch : Dispatch, state : State, parsed, scaleId : number, defs) {
  const map  = parsed.map,
      mark = parsed.mark,
      parentId = mark.get('_parent'),
      scale = getInVis(state, 'scales.' + scaleId),
      axes  = getInVis(state, 'marks.' + parentId).get('axes');
  let def, prevOrient, count = 0, foundAxis = false;

  // First, find an def and then iterate through axes for the current group
  // to see if an axis exists for this scale or if we have room to add one more.
  def = defs.find(function(axisDef) {
    return map.scales[axisDef.scale] === scaleId;
  });

  axes.valueSeq().forEach(function(axisId) {
    var axis = getInVis(state, 'guides.' + axisId);
    if (!axis) {
      return true;
    }

    if (axis.get('type') === def.type) {
      ++count;
      prevOrient = axis.get('orient');
    }

    if (axis.get('scale') === scaleId) {
      foundAxis = true;
      return false; // Early exit.
    }

    // Test domain/range since point/band-ordinal scales can share an axis.
    const axisScale = getInVis(state, 'scales.' + axis.get('scale'));
    if (axisScale.get('type') === 'ordinal') {
      foundAxis = ['domain', 'range'].every(function(x) {
        const araw = axisScale.get(x),
            sraw = scale.get(x),
            aref = axisScale.get('_' + x),
            sref = scale.get('_' + x),
            apl  = getInVis(state, 'datasets.' + getIn(aref, '0.data') + '._parent'),
            spl  = getInVis(state, 'datasets.' + getIn(sref, '0.data') + '._parent'),
            afl  = getIn(aref, '0.field'),
            sfl  = getIn(sref, '0.field');
        return araw ? araw === sraw || araw.equals(sraw) :
          apl === spl && afl === sfl;
      });
      return !foundAxis;
    }
  });

  if (foundAxis) {
    return;
  }

  if (count < 2) {
    let axis = Guide(GuideType.Axis, def.type, scaleId) as AxisRecord;
    axis = axis.mergeDeep({
      'title': def.title,
      'zindex': def.zindex,
      'grid': def.grid,
      'axis': (count === 1 && prevOrient) ? SWAP_ORIENT[prevOrient] : def.orient || axis.orient,
      'encode': def.encode
    });

    const axisAction = addGuide(axis);
    dispatch(axisAction);
    dispatch(addAxisToGroup(axisAction.meta, parentId));
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
function findOrCreateLegend(dispatch : Dispatch, state : State, parsed, scaleId : number, defs) {
  const map = parsed.map,
      mark = parsed.mark,
      property = parsed.property,
      parentId = mark.get('_parent'),
      legends = getInVis(state, 'marks.' + parentId).get('legends');
  let def, foundLegend = false;

  def = defs.find(function(legendDef) {
    return map.scales[legendDef[property]] === scaleId;
  });

  legends.valueSeq().forEach(function(legendId) {
    var legend = getInVis(state, 'guides.' + legendId);
    if (legend) {
      foundLegend = foundLegend || legend.get(property) === scaleId;
    }
  });

  if (!foundLegend) {
    let legend = Guide(GuideType.Legend, property, scaleId) as LegendRecord;
    legend = legend.deleteIn(['encode','symbols', property]);
    legend = legend.mergeDeep({
      'title': def.title,
      'encode': def.encode
    });
    // delete legend.properties.symbols[property];
    const legendAction = addGuide(legend);
    dispatch(legendAction);
    dispatch(addLegendToGroup(legendAction.meta, parentId));
  }
}
