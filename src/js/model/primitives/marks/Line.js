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
 * @classdesc A Lyra Line Mark Primitive.
 * @see  {@link https://github.com/vega/vega/wiki/Marks#line}
 * @extends {Mark}
 *
 * @constructor
 */
function Line() {
  Mark.call(this, {
    type: 'line',
    properties: {
      // Defaults
      update: {
        stroke: {value: '#000000'},
        strokeWidth: {value: 3}
      }
    }
  });

  return this;
}

// inherit Mark class' prototype
inherits(Line, Mark);

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

  delete spec.properties.update.fill;
  delete spec.properties.update.fillOpacity;

  return spec;
};

module.exports = Line;
