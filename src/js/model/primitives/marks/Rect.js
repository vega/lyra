var dl = require('datalib'),
    sg = require('../../../model/signals'),
    Mark = require('./Mark'),
    manips = require('./manipulators'),
    util = require('../../../util');

var DELTA  = sg.DELTA,
    DX = DELTA+'.x',
    DY = DELTA+'.y';

function Rect(type) {
  Mark.call(this, 'rect');

  var props  = this.properties,
      update = props.update;

  dl.extend(update, {
    x2: {value: 60},
    y2: {value: 60},
    xc: {value: 60, _disabled: true},
    yc: {value: 60, _disabled: true},
    width:  {value: 30, _disabled: true},
    height: {value: 30, _disabled: true}
  });

  return this;
}

var prototype = (Rect.prototype = Object.create(Mark.prototype));
prototype.constructor = Rect;

prototype.initHandles = function() {
  var prop = util.propSg,
      test = util.test,
      at = util.anchorTarget.bind(util, this, 'handles'),
      x = prop(this, 'x'), xc = prop(this, 'xc'), x2 = prop(this, 'x2'),
      y = prop(this, 'y'), yc = prop(this, 'yc'), y2 = prop(this, 'y2'),
      w = prop(this, 'width'), h = prop(this, 'height');

  sg.streams(x, [{
    type: DELTA, expr: test(at()+'||'+at('left'), x+'+'+DX, x)
  }]);

  sg.streams(xc, [{
    type: DELTA, expr: test(at()+'||'+at('left'), xc+'+'+DX, xc)
  }]);

  sg.streams(x2, [{
    type: DELTA, expr: test(at()+'||'+at('right'), x2+'+'+DX, x2)
  }]);

  sg.streams(y, [{
    type: DELTA, expr: test(at()+'||'+at('top'), y+'+'+DY, y)
  }]);

  sg.streams(yc, [{
    type: DELTA, expr: test(at()+'||'+at('top'), yc+'+'+DY, yc)
  }]);

  sg.streams(y2, [{
    type: DELTA, expr: test(at()+'||'+at('bottom'), y2+'+'+DY, y2)
  }]);

  sg.streams(w, [
    {type: DELTA, expr: test(at('left'),  w+'-'+DX, w)},
    {type: DELTA, expr: test(at('right'), w+'+'+DX, w)}
  ]);

  sg.streams(h, [
    {type: DELTA, expr: test(at('top'),    h+'-'+DY, h)},
    {type: DELTA, expr: test(at('bottom'), h+'+'+DY, h)}
  ]);
};

module.exports = Rect;
