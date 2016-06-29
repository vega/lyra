'use strict';

var anchorTarget = require('../../../util/anchor-target'),
    test = require('../../../util/test-if'),
    propSg = require('../../../util/prop-signal');

/**
 * An area mark factory.
 * @returns {Object} Additional default visual properties for an area mark.
 */
function Area() {
  return {
    properties: {
      update: {
        x2: {value: 0},
        y2: {value: 0},
        tension: {value: 13},
        interpolate: {value: 'monotone'},
        orient: {value: 'vertical'}
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
 * @param {Object} area - A area properties object or instantiated area mark
 * @param {number} area._id - A numeric mark ID
 * @param {string} area.type - A mark type, presumably "area"
 * @returns {Object} A dictionary of stream definitions keyed by signal name
 */
Area.getHandleStreams = function(area) {
  var sg = require('../../../ctrl/signals'),
      at = anchorTarget.bind(null, area, 'handles'),
      id = area._id,
      x  = propSg(id, 'area', 'x'),
      xc = propSg(id, 'area', 'xc'),
      x2 = propSg(id, 'area', 'x2'),
      y  = propSg(id, 'area', 'y'),
      yc = propSg(id, 'area', 'yc'),
      y2 = propSg(id, 'area', 'y2'),
      w = propSg(id, 'area', 'width'),
      h = propSg(id, 'area', 'height'),
      DELTA = sg.DELTA,
      DX = DELTA + '.x',
      DY = DELTA + '.y',
      streams = {};

  streams[x] = [{
    type: DELTA, expr: test(at() + '||' + at('left'), x + '+' + DX, x)
  }];
  streams[xc] = [{
    type: DELTA, expr: test(at() + '||' + at('left'), xc + '+' + DX, xc)
  }];
  streams[x2] = [{
    type: DELTA, expr: test(at() + '||' + at('right'), x2 + '+' + DX, x2)
  }];
  streams[y] = [{
    type: DELTA, expr: test(at() + '||' + at('top'), y + '+' + DY, y)
  }];
  streams[yc] = [{
    type: DELTA, expr: test(at() + '||' + at('top'), yc + '+' + DY, yc)
  }];
  streams[y2] = [{
    type: DELTA, expr: test(at() + '||' + at('bottom'), y2 + '+' + DY, y2)
  }];
  streams[w] = [
    {type: DELTA, expr: test(at('left'), w + '-' + DX, w)},
    {type: DELTA, expr: test(at('right'), w + '+' + DX, w)}
  ];
  streams[h] = [
    {type: DELTA, expr: test(at('top'), h + '-' + DY, h)},
    {type: DELTA, expr: test(at('bottom'), h + '+' + DY, h)}
  ];
  return streams;
};

// Parameters you can set on AREA
Area.ORIENT = ['horizontal', 'vertical'];

module.exports = Area;
