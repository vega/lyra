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
 * @classdesc A Lyra Area Mark Primitive.
 * @see  {@link https://github.com/vega/vega/wiki/Marks#area}
 * @extends {Mark}
 *
 * @constructor
 * @param {Object} [props] - An object defining this mark's properties
 * @param {string} props.type - The type of mark (should be 'area')
 * @param {Object} props.properties - A Vega mark properties object
 * @param {string} [props.name] - The name of the mark
 * @param {number} [props._id] - A unique mark ID
 */
function Area(props) {
  Mark.call(this, props || Area.defaultProperties());
}

// inherit Mark class' prototype
inherits(Area, Mark);

/**
 * Returns an object representing the default values for an area mark,
 * containing a type string and a Vega mark properties object.
 *
 * @static
 * @returns {Object} The default mark properties
 */
Area.defaultProperties = function() {
  return {
    type: 'area',
    // name: 'area' + '_' + counter.type('area'); // Assign name in the reducer
    // _id: assign ID in the reducer
    properties: Mark.mergeProperties(Mark.defaultProperties(), {
      update: {
        x2: {value: 0},
        y2: {value: 0},
        xc: {value: 60, _disabled: true},
        yc: {value: 60, _disabled: true},
        tension: {value: 13},
        interpolate: {value: 'monotone'},
        fill: {value: '#55498D'},
        stroke: {value: '#55498D'},
        orient: {value: 'vertical'},
        width: {value: 30, _disabled: true},
        height: {value: 30, _disabled: true}
      }
    })
  };
};

Area.prototype.initHandles = function() {
  var at = anchorTarget.bind(null, this, 'handles'),
      x = propSg(this, 'x'),
      xc = propSg(this, 'xc'),
      x2 = propSg(this, 'x2'),
      y = propSg(this, 'y'),
      yc = propSg(this, 'yc'),
      y2 = propSg(this, 'y2'),
      w = propSg(this, 'width'),
      h = propSg(this, 'height');

  sg.streams(x, [{
    type: DELTA, expr: test(at() + '||' + at('left'), x + '+' + DX, x)
  }]);

  sg.streams(xc, [{
    type: DELTA, expr: test(at() + '||' + at('left'), xc + '+' + DX, xc)
  }]);

  sg.streams(x2, [{
    type: DELTA, expr: test(at() + '||' + at('right'), x2 + '+' + DX, x2)
  }]);

  sg.streams(y, [{
    type: DELTA, expr: test(at() + '||' + at('top'), y + '+' + DY, y)
  }]);

  sg.streams(yc, [{
    type: DELTA, expr: test(at() + '||' + at('top'), yc + '+' + DY, yc)
  }]);

  sg.streams(y2, [{
    type: DELTA, expr: test(at() + '||' + at('bottom'), y2 + '+' + DY, y2)
  }]);

  sg.streams(w, [
    {type: DELTA, expr: test(at('left'), w + '-' + DX, w)},
    {type: DELTA, expr: test(at('right'), w + '+' + DX, w)}
  ]);

  sg.streams(h, [
    {type: DELTA, expr: test(at('top'), h + '-' + DY, h)},
    {type: DELTA, expr: test(at('bottom'), h + '+' + DY, h)}
  ]);
};


Area.prototype.export = function(resolve) {
  var spec = Mark.prototype.export.call(this, resolve);
  if (!spec.from) {
    spec.from = {
      data: 'dummy_data_area'
    };
    spec.properties.update.x = {
      field: 'x'
    };
    spec.properties.update.y = {
      field: 'y'
    };
  }
  if (spec.properties.update.orient.value === 'horizontal') {
    delete spec.properties.update.y2;
  } else {
    delete spec.properties.update.x2;
  }
  return spec;
};

// Parameters you can set on AREA
Area.INTERPOLATE = [
  'linear',
  'step-before',
  'step-after',
  'basis',
  'basis-open',
  'cardinal',
  'cardinal-open',
  'monotone'
];
Area.ORIENT = ['horizontal', 'vertical'];

module.exports = Area;
