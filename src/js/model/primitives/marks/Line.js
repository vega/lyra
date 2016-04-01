'use strict';
var inherits = require('inherits'),
    sg = require('../../../model/signals'),
    Mark = require('./Mark'),
    anchorTarget = require('../../../util/anchor-target'),
    test = require('../../../util/test-if'),
    propSg = require('../../../util/prop-signal');

var DELTA = sg.DELTA,
    DX = DELTA + '.x',
    DY = DELTA + '.y';

/**
 * @classdesc A Lyra Line Mark Primitive.
 * @see  {@link https://github.com/vega/vega/wiki/Marks#line}
 * @extends {Mark}
 *
 * @constructor
 * @param {Object} [props] - An object defining this mark's properties
 * @param {string} props.type - The type of mark (should be 'line')
 * @param {Object} props.properties - A Vega mark properties object
 * @param {string} [props.name] - The name of the mark
 * @param {number} [props._id] - A unique mark ID
 */
function Line(props) {
  Mark.call(this, props || Line.defaultProperties());
}

// inherit Mark class' prototype
inherits(Line, Mark);

/**
 * Returns an object representing the default values for a rect mark, containing
 * a type string and a Vega mark properties object.
 *
 * @static
 * @returns {Object} The default mark properties
 */
Line.defaultProperties = function() {
  var defaults = {
    type: 'line',
    // name: 'line' + '_' + counter.type('line'); // Assign name in the reducer
    // _id: assign ID in the reducer
    properties: Mark.mergeProperties(Mark.defaultProperties(), {
      update: {
        stroke: {value: '#000000'},
        strokeWidth: {value: 3}
      }
    })
  };
  // Mark gives us two defaults we do not want
  delete defaults.properties.update.fill;
  delete defaults.properties.update.fillOpacity;
  return defaults;
};

Line.prototype.initHandles = function() {
  var at = anchorTarget.bind(null, this, 'handles'),
      x = propSg(this, 'x'),
      y = propSg(this, 'y');

  sg.streams(x, [{
    type: DELTA, expr: test(at(), x + '+' + DX, x)
  }]);

  sg.streams(y, [{
    type: DELTA, expr: test(at(), y + '+' + DY, y)
  }]);

};

Line.prototype.export = function(resolve) {
  var spec = Mark.prototype.export.call(this, resolve);
  if (!spec.from) {
    spec.from = {
      data: 'dummy_data_line'
    };
    spec.properties.update.x = {
      field: 'foo'
    };
    spec.properties.update.y = {
      field: 'bar'
    };
  }

  return spec;
};

module.exports = Line;
