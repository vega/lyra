'use strict';
var anchorTarget = require('../../../util/anchor-target'),
    test = require('../../../util/test-if'),
    propSg = require('../../../util/prop-signal');

/**
 * A symbol mark factory.
 * @returns {Object} Additional default visual properties for a symbol mark.
 */
function Symbol() {
  return {
    properties: {
      update: {
        size: {value: 100},
        shape: {value: 'circle'}
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
 * @param {Object} symbol - A symbol properties object or instantiated symbol mark
 * @param {number} symbol._id - A numeric mark ID
 * @param {string} symbol.type - A mark type, presumably "symbol"
 * @returns {Object} A dictionary of stream definitions keyed by signal name
 */
Symbol.getHandleStreams = function(symbol) {
  var sg = require('../../../model/signals'),
      at = anchorTarget.bind(null, symbol, 'handles'),
      id = symbol._id,
      x = propSg(id, 'symbol', 'x'),
      y = propSg(id, 'symbol', 'y'),
      size = propSg(id, 'symbol', 'size'),
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
  streams[size] = [
    {type: DELTA, expr: test(at('top'), size + '-(' + DY + '<<5)', size)},
    {type: DELTA, expr: test(at('bottom'), size + '+(' + DY + '<<5)', size)}
  ];
  return streams;
};

Symbol.SHAPES = [
  'circle',
  'square',
  'cross',
  'diamond',
  'triangle-up',
  'triangle-down'
];

module.exports = Symbol;
