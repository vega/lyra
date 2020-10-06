import {Dispatch} from 'redux';
import {Axis} from 'vega';
import {CompiledBinding} from '.';
import {State} from '../../store';
import {AxisRecord, Guide, GuideType, LegendRecord} from '../../store/factory/Guide';
import {addGuide} from '../guideActions';
import {addAxisToGroup, addLegendToGroup} from './helperActions';
import {assignId} from '../../util/counter';
import {ThunkDispatch} from 'redux-thunk';

const imutils = require('../../util/immutable-utils'),
  getIn = imutils.getIn,
  getInVis = imutils.getInVis;

const CTYPE = {
  x: GuideType.Axis,
  y: GuideType.Axis,
  color: GuideType.Legend,
  size: GuideType.Legend,
  shape: GuideType.Legend
};

const SWAP_ORIENT = {
  left: 'right',
  right: 'left',
  top: 'bottom',
  bottom: 'top'
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
export default function parseGuides(dispatch: Dispatch, state: State, parsed: CompiledBinding) {
  const channel = parsed.channel,
    map = parsed.map,
    guideType = CTYPE[channel],
    scaleId = map.scales[channel],
    group = parsed.output;

  if (!guideType || !scaleId) {
    return;
  }

  if (guideType === GuideType.Axis) {
    findOrCreateAxis(dispatch, state, parsed, scaleId, group.axes);
  } else {
    findOrCreateLegend(dispatch, state, parsed, scaleId, group.legends);
  }
}

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
function findOrCreateAxis(dispatch: ThunkDispatch<State, any, any>, state: State, parsed: CompiledBinding, scaleId: number, defs: Axis[]) {
  const map = parsed.map,
    mark = parsed.mark,
    parentId = mark._parent,
    scale = getInVis(state, `scales.${scaleId}`),
    axes = getInVis(state, `marks.${parentId}.axes`);

  let foundAxis = false,
    count = 0,
    prevOrient;

  // First, find a def and then iterate through axes for the current group
  // to see if an axis exists for this scale or if we have room to add one more.
  const def = defs.filter(axis => map.scales[axis.scale] === scaleId);

  axes.some(function(axisId) {
    const axis = getInVis(state, `guides.${axisId}`);
    if (!axis) {
      return false;
    }

    if (axis.scale === scaleId) {
      return (foundAxis = true); // Early exit.
    }

    if (axis.orient === def[0].orient) {
      ++count;
      prevOrient = axis.orient;
    }

    // Test domain/range since point/band-ordinal scales can share an axis.
    // const axisScale = getInVis(state, 'scales.' + axis.get('scale'));
    // if (axisScale.get('type') === 'ordinal') {
    //   foundAxis = ['domain', 'range'].every(function(x) {
    //     const araw = axisScale.get(x),
    //       sraw = scale.get(x),
    //       aref = axisScale.get('_' + x),
    //       sref = scale.get('_' + x),
    //       apl = getInVis(state, 'datasets.' + getIn(aref, '0.data') + '._parent'),
    //       spl = getInVis(state, 'datasets.' + getIn(sref, '0.data') + '._parent'),
    //       afl = getIn(aref, '0.field'),
    //       sfl = getIn(sref, '0.field');
    //     return araw ? araw === sraw || araw.equals(sraw) : apl === spl && afl === sfl;
    //   });
    //   return !foundAxis;
    // }
  });

  if (foundAxis) {
    return;
  }

  if (count < 2) {
    let axis = Guide(GuideType.Axis, parsed.channel, scaleId) as AxisRecord;
    axis = axis.mergeDeep({
      title: def[1].title,
      // zindex: def[0].zindex,
      grid: def.length > 1,
      orient: count === 1 && prevOrient ? SWAP_ORIENT[prevOrient] : def[1].orient || axis.orient,
      encode: def[1].encode
    });

    const axisId = assignId(dispatch, state);
    axis = axis.merge({_id: axisId});
    dispatch(addGuide(axis));
    dispatch(addAxisToGroup(axisId, parentId));
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
function findOrCreateLegend(dispatch: ThunkDispatch<State, any, any>, state: State, parsed, scaleId: number, defs) {
  const map = parsed.map,
    mark = parsed.mark,
    property = parsed.property,
    parentId = mark._parent,
    legends = getInVis(state, `marks.${parentId}.legends`);

  let foundLegend = false;

  const def = defs.find(legend => map.scales[legend[property]] === scaleId);

  legends.some(function(legendId) {
    const legend = getInVis(state, `guides.${legendId}`);
    if (legend) {
      return (foundLegend = foundLegend || legend.get(property) === scaleId);
    }
  });

  if (!foundLegend) {
    let legend = Guide(GuideType.Legend, property, scaleId) as LegendRecord;
    legend = legend.deleteIn(['encode', 'symbols', property]);
    legend = legend.mergeDeep({
      title: def.title,
      encode: def.encode
    });

    const legendId = assignId(dispatch, state);
    legend = legend.merge({_id: legendId});
    dispatch(addGuide(legend));
    dispatch(addLegendToGroup(legendId, parentId));
  }
}
