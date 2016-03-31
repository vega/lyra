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
 * @classdesc A Lyra Area Mark Primitive.
 * @see  {@link https://github.com/vega/vega/wiki/Marks#area}
 * @extends {Mark}
 *
 * @constructor
 */
function Area() {
  Mark.call(this, {
    type: 'area',
    properties: {
      update: {
        // Defaults
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
    }
  });

  return this;
}

// inherit Mark class' prototype
inherits(Area, Mark);


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
