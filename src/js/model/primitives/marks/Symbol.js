var dl = require('datalib'),
    sg = require('../../../model/signals'),
    Mark = require('./Mark'),
    util = require('../../../util');

var DELTA = sg.DELTA,
    DX = DELTA + '.x',
    DY = DELTA + '.y';

function Symbol(type) {
  Mark.call(this, 'symbol');

  var props = this.properties,
      update = props.update;

  dl.extend(update, {
    size: {value: 100},
    shape: {value: 'circle'}
  });

  return this;
}

var prototype = (Symbol.prototype = Object.create(Mark.prototype));
prototype.constructor = Symbol;

prototype.initHandles = function() {
  var prop = util.propSg,
      test = util.test,
      at = util.anchorTarget.bind(util, this, 'handles'),
      x = prop(this, 'x'),
      y = prop(this, 'y'),
      size = prop(this, 'size');

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

module.exports = Symbol;
Symbol.SHAPES = ['circle', 'square', 'cross',
  'diamond', 'triangle-up', 'triangle-down'];
