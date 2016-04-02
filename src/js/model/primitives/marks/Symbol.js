'use strict';
var dl = require('datalib'),
    inherits = require('inherits'),
    sg = require('../../../model/signals'),
    Mark = require('./Mark'),
    anchorTarget = require('../../../util/anchor-target'),
    test = require('../../../util/test-if'),
    propSg = require('../../../util/prop-signal');

var DELTA = sg.DELTA,
    DX = DELTA + '.x',
    DY = DELTA + '.y';

/**
 * @classdesc A Lyra Symbol Mark Primitive.
 * @extends {Mark}
 *
 * @constructor
 * @param {Object} [props] - An object defining this mark's properties
 * @param {string} props.type - The type of mark (should be 'symbol')
 * @param {Object} props.properties - A Vega mark properties object
 * @param {string} [props.name] - The name of the mark
 * @param {number} [props._id] - A unique mark ID
 */
function Symbol(props) {
  Mark.call(this, props || Symbol.defaultProperties());
}

inherits(Symbol, Mark);

/**
 * Returns an object representing the default values for a symbol mark,
 * containing a type string and a Vega mark properties object.
 *
 * @static
 * @param {Object} [props] - Props to merge into the returned default properties object
 * @returns {Object} The default mark properties
 */
Symbol.defaultProperties = function(props) {
  return dl.extend({
    type: 'symbol',
    // name: 'symbol' + '_' + counter.type('symbol'); // Assign name in the reducer
    // _id: assign ID in the reducer
    properties: Mark.mergeProperties(Mark.defaultProperties(), {
      update: {
        size: {value: 100},
        shape: {value: 'circle'}
      }
    })
  }, props);
};

Symbol.prototype.initHandles = function() {
  var at = anchorTarget.bind(null, this, 'handles'),
      x = propSg(this, 'x'),
      y = propSg(this, 'y'),
      size = propSg(this, 'size');

  sg.streams(x, [{
    type: DELTA, expr: test(at(), x + '+' + DX, x)
  }]);

  sg.streams(y, [{
    type: DELTA, expr: test(at(), y + '+' + DY, y)
  }]);

  sg.streams(size, [
    {type: DELTA, expr: test(at('top'), size + '-(' + DY + '<<5)', size)},
    {type: DELTA, expr: test(at('bottom'), size + '+(' + DY + '<<5)', size)}
  ]);
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
