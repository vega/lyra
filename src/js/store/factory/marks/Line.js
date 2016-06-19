'use strict';
var anchorTarget = require('../../../util/anchor-target'),
    test = require('../../../util/test-if'),
    propSg = require('../../../util/prop-signal');

/**
 * A line mark factory.
 * @returns {Object} Additional default visual properties for a line mark.
 */
function Line() {
  return {
    properties: {
      update: {
        fill: undefined,
        fillOpacity: undefined,
        strokeWidth: {value: 3},
        tension: {value: 13},
        interpolate: {value: 'monotone'}
      }
    }
  };
}

/**
 * Return an array of handle signal stream definitions to be instantiated.
 *
 * The returned object is used to initialize the interaction logic for the mark's
 * handle manipulators. This involves setting the mark's property signals
 * {@link https://github.com/vega/vega/wiki/Signals|streams}.
 *
 * @param {Object} line - A line properties object or instantiated line mark
 * @param {number} line._id - A numeric mark ID
 * @param {string} line.type - A mark type, presumably "line"
 * @returns {Object} A dictionary of stream definitions keyed by signal name
 */
Line.getHandleStreams = function(line) {
  var sg = require('../../../model/signals'),
      at = anchorTarget.bind(null, line, 'handles'),
      id = line._id,
      x = propSg(id, 'line', 'x'),
      y = propSg(id, 'line', 'y'),
      DELTA = sg.DELTA,
      DX = DELTA + '.x',
      DY = DELTA + '.y',
      streams = {};

  streams[x] = [{
    type: DELTA, expr: test(at(), x + '+' + DX, x)
  }];
  streams[y] = [{
    type: DELTA, expr: test(at(), y + '+' + DY, y)
  }];
  return streams;
};

module.exports = Line;
