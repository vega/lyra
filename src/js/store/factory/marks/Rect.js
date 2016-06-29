'use strict';

var anchorTarget = require('../../../util/anchor-target'),
    test = require('../../../util/test-if'),
    propSg = require('../../../util/prop-signal');

/**
 * A rect mark factory.
 * @returns {Object} Additional default visual properties for a rect mark.
 */
function Rect() {
  return {
    properties: {
      update: {
        x2: {value: 60},
        y2: {value: 60},
        xc: {value: 60, _disabled: true},
        yc: {value: 60, _disabled: true},
        width: {value: 30, _disabled: true},
        height: {value: 30, _disabled: true}
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
 * @param {Object} rect - A rect properties object or instantiated Rect mark
 * @param {number} rect._id - A numeric mark ID
 * @param {string} rect.type - A mark type, presumably "rect"
 * @returns {Object} A dictionary of stream definitions keyed by signal name
 */
Rect.getHandleStreams = function(rect) {
  var sg = require('../../../ctrl/signals'),
      at = anchorTarget.bind(null, rect, 'handles'),
      id = rect._id,
      type = rect.type,
      x = propSg(id, type, 'x'),
      xc = propSg(id, type, 'xc'),
      x2 = propSg(id, type, 'x2'),
      y = propSg(id, type, 'y'),
      yc = propSg(id, type, 'yc'),
      y2 = propSg(id, type, 'y2'),
      w = propSg(id, type, 'width'),
      h = propSg(id, type, 'height'),
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

module.exports = Rect;
