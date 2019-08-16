'use strict';

import {setSignal} from '../signalActions';
import {setMarkVisual, disableMarkVisual, updateMarkProperty} from '../markActions';
import {Dispatch} from 'redux';
import {State} from '../../store';
import {propSg} from '../../util/prop-signal';
import MARK_EXTENTS from '../../constants/markExtents';

const dl = require('datalib'),
  imutils = require('../../util/immutable-utils'),
  getInVis = imutils.getInVis,
  getIn = imutils.getIn;

/**
 * Parses the mark definition in the resultant Vega specification to determine
 * how to update the Lyra mark in the redux store.
 *
 * @param {Function} dispatch  Redux dispatch function.
 * @param {ImmutableMap} state Redux store.
 * @param {Object} parsed      An object containing the parsed and output Vega
 * specifications as well as a mapping of output spec names to Lyra IDs.
 * @returns {void}
 */
export function parseMarks(dispatch: Dispatch, state: State, parsed) {
  const markType = parsed.markType,
    map = parsed.map,
    markId = parsed.markId,
    channel = parsed.channel,
    def = parsed.output.marks[0].marks[0],
    props = def.encode.update;

  if (markType === 'rect' && (channel === 'x' || channel === 'y')) {
    rectSpatial(dispatch, state, parsed, props);
  } else if (markType === 'text' && channel === 'text') {
    textTemplate(dispatch, parsed, props);
  } else {
    bindProperty(dispatch, parsed, props);
  }

  if (def.from && def.from.data) {
    dispatch(updateMarkProperty({property: 'from', value: {data: map.data[def.from.data]}}, markId));
  }
}

/**
 * Updates a Lyra mark property using the parsed Vega property definition.
 *
 * @param   {Function} dispatch Redux dispatch function.
 * @param   {Object} parsed   An object containing the parsed and output Vega
 * specifications as well as a mapping of output spec names to Lyra IDs.
 * @param   {Object} def      The parsed Vega visual properties for the mark.
 * @param   {string} [property=parsed.property]  The visual property to bind.
 * @returns {void}
 */
function bindProperty(dispatch: Dispatch, parsed, def, property?: string) {
  let map = parsed.map;
  const markId = parsed.markId,
    markType = parsed.markType,
    prop = {} as any;
  property = property || parsed.property;

  if (property === 'stroke') {
    def = def.stroke || def.fill;
  } else {
    def = def[property];
  }

  if (def.scale !== undefined) {
    prop.scale = map.scales[def.scale];
  }

  if (def.field !== undefined) {
    if (def.field.group) {
      prop.group = def.field.group;
    } else {
      prop.field = def.field;
    }
  }

  if (def.value !== undefined) {
    prop.signal = propSg(markId, markType, property);
    dispatch(setSignal(prop.signal, def.value));
  }

  if (def.band !== undefined) {
    prop.band = def.band;
  }

  if (def.offset !== undefined) {
    prop.offset = def.offset;
  }

  dispatch(setMarkVisual({property: property, def: prop}, markId));

  // Set a timestamp on the property to facilitate smarter disabling of rect
  // spatial properties.
  map = map.marks[markId] || (map.marks[markId] = {});
  map[property] = Date.now();
}

/**
 * Binding a spatial channel of a rect mark requires binding two properties.
 * For example, Vega-Lite produces center/span (e.g., xc/width) properties when
 * using an ordinal-point scale. However, Lyra prefers using start/span.
 *
 * @param   {Function} dispatch Redux dispatch function.
 * @param {ImmutableMap} state Redux store.
 * @param   {Object} parsed   An object containing the parsed and output Vega
 * specifications as well as a mapping of output spec names to Lyra IDs.
 * @param   {Object} def      The parsed Vega visual properties for the mark.
 * @returns {void}
 */
const RECT_SPANS = {x: 'width', y: 'height'};
function rectSpatial(dispatch: Dispatch, state: State, parsed, def) {
  const channel = parsed.channel,
    property = parsed.property,
    markId = parsed.markId,
    map = parsed.map.marks[markId],
    max = channel + '2',
    cntr = channel + 'c',
    span = RECT_SPANS[channel],
    EXTENTS = dl.vals(MARK_EXTENTS[channel]),
    props = getInVis(state, 'marks.' + markId + '.properties.update');
  let count = 0;

  // If we're binding a literal spatial property (i.e., not arrow manipulators),
  // bind only that property.
  if (property !== channel + '+') {
    // Ensure that only two spatial properties will be set. We sort them to
    // try our best guess for disabling "older" properties.
    EXTENTS.map(function(ext) {
      return dl.extend({ts: (map && map[ext.name]) || 0}, ext);
    })
      .sort(dl.comparator('-ts'))
      .forEach(function(ext) {
        var name = ext.name;
        if (name === property) {
          return;
        } else if (count >= 1) {
          dispatch(disableMarkVisual(markId, name));
        } else if (!getIn(props, name + '._disabled')) {
          ++count;
        }
      });

    def[property] = def[channel] || def[cntr] || def[property];
    return bindProperty(dispatch, parsed, def);
  }

  // Clean slate the rect spatial properties by disabling them all. Subsequent
  // bindProperty calls will reenable them as needed.
  EXTENTS.forEach(function(ext) {
    dispatch(disableMarkVisual(markId, ext.name));
  });

  if (def[max]) {
    bindProperty(dispatch, parsed, def, channel);
    bindProperty(dispatch, parsed, def, max);
  } else {
    def[channel] = def[cntr]; // Map xc/yc => x/y for binding.
    bindProperty(dispatch, parsed, def, channel);

    def[span] = {
      scale: def[channel].scale,
      band: true,
      offset: -1
    };
    bindProperty(dispatch, parsed, def, span);
  }
}

/**
 * Binding a field to a text mark's text property should generate a Vega
 * template string, not a field binding.
 *
 * @param   {Function} dispatch Redux dispatch function.
 * @param   {Object} parsed   An object containing the parsed and output Vega
 * specifications as well as a mapping of output spec names to Lyra IDs.
 * @param   {Object} def      The parsed Vega visual properties for the mark.
 * @returns {void}
 */
function textTemplate(dispatch: Dispatch, parsed, def) {
  dispatch(
    setMarkVisual(
      {
        property: 'text',
        def: {
          template: '{{datum.' + def.text.field + '}}'
        } as any
      },
      parsed.markId
    )
  );
}
