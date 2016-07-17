/* eslint consistent-this:0, no-undefined:0*/
'use strict';

var dl = require('datalib'),
    Rect = require('./Rect'); // Visually, groups are similar to Rects.

/**
 * A group mark factory.
 * @returns {Object} Additional default properties for a group mark.
 */
function Group() {
  var signalLookup = require('../../../util/signal-lookup'),
      base = Rect();
  return {
    scales: [],
    axes: [],
    legends: [],
    marks: [],
    properties: {
      // To allow marks across layered groups to be selected interactively on
      // the campus, groups do not have a fill color by default. Users may, of
      // course set a fill color. If a group is explicitly selected from the
      // sidebar, a transparent fill is rendered in order for direct
      // manipulation events of the group itself to be captured.
      update: dl.extend({}, base.properties.update, {
        fill: undefined,
        stroke: undefined,
        x: {value: 0},
        y: {value: 0},
        width: {value: signalLookup('vis_width')},
        height: {value: signalLookup('vis_height')},
        x2: {_disabled: true},
        y2: {_disabled: true}
      })
    }
  };
}

Group.getHandleStreams = Rect.getHandleStreams;

module.exports = Group;

