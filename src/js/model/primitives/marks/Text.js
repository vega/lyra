var dl = require('datalib'),
    inherits = require('inherits'),
    sg = require('../../../model/signals'),
    Mark = require('./Mark'),
    util = require('../../../util');

var DELTA = sg.DELTA,
    DX = DELTA + '.x',
    DY = DELTA + '.y';

/**
 * @classdesc A Lyra Text Mark Primitive.
 * @extends {Mark}
 *
 * @constructor
 */
function Text() {
  Mark.call(this, 'text');

  dl.extend(this.properties.update, {
    strokeWidth: {value: 0},
    // Position text simply with dx/dy
    x: {value: 0},
    y: {value: 0},
    dx: {value: 0, offset: 0},
    dy: {value: 0, offset: 0},
    // Text-specific properties
    text: {value: 'Text'},
    align: {value: 'center'},
    baseline: {value: 'middle'},
    font: {value: 'Helvetica'},
    fontSize: {value: 12},
    angle: {value: 0}
  });

  return this;
}

inherits(Text, Mark);

Text.prototype.initHandles = function() {
  var prop = util.propSg,
      test = util.test,
      at = util.anchorTarget.bind(util, this, 'handles'),
      dx = prop(this, 'dx'),
      dy = prop(this, 'dy'),
      fontSize = prop(this, 'fontSize');

  sg.streams(dx, [{
    type: DELTA, expr: test(at(), dx + '+' + DX, dx)
  }]);
  sg.streams(dy, [{
    type: DELTA, expr: test(at(), dy + '+' + DY, dy)
  }]);

  // Allow upper-left and lower-right handles to control font size
  sg.streams(fontSize, [
    {type: DELTA, expr: test(at('left') + '&&' + at('top'), fontSize + '-' + DX, fontSize)},
    {type: DELTA, expr: test(at('right') + '&&' + at('bottom'), fontSize + '+' + DX, fontSize)},
    {type: DELTA, expr: test(at('left') + '&&' + at('top'), fontSize + '-' + DY, fontSize)},
    {type: DELTA, expr: test(at('right') + '&&' + at('bottom'), fontSize + '+' + DY, fontSize)}
  ]);
};

module.exports = Text;
