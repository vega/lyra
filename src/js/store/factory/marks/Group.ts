/* eslint consistent-this:0, no-undefined:0*/
'use strict';

var dl = require('datalib'),
    getInVis = require('../../../util/immutable-utils').getInVis,
    Rect = require('./Rect'); // Visually, groups are similar to Rects.


export type LyraGroupMark = {
  _id: number
} & GroupMark;

export const Area = Record<LyraGroupMark>({
  _id: null,
  type: 'area',
  encode: {
    update: {
      // x2: {value: 0},
      y2: {value: 0},
      tension: {value: 13},
      interpolate: {value: 'monotone'},
      orient: {value: 'vertical'}
    }
  }
});

/**
 * A group mark factory.
 * @returns {Object} Additional default properties for a group mark.
 */
function Group() {
  var base = Rect(),
      state = require('../../').getState(),
      scene = getInVis(state, 'marks.' + getInVis(state, 'scene.id'));
  return {
    // Has the user manually set the width/height of this group? If so, any
    // automatic adjustments to width/height made during data binding will not
    // affect it.
    _manualLayout: false,

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
        width: {value: scene && scene.get('width')},
        height: {value: scene && scene.get('height')},
        x2: {_disabled: true},
        y2: {_disabled: true}
      })
    }
  };
}

Group.getHandleStreams = Rect.getHandleStreams;

module.exports = Group;

