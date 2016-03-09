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
    text: {value: 'Text'},
    align: {value: 'left'},
    x: {value: 70},
    x2: {value: 105},
    y2: {value: 60},
    xc: {value: 60, _disabled: true},
    yc: {value: 60, _disabled: true},
    width: {value: 35, _disabled: true},
    height: {value: 35, _disabled: true},
    angle: {value: 0},
    font: {value: 'Helvetica'},
    fontSize: {value: 12},
    strokeWidth: {value: 0}
  });

  return this;
}

inherits(Text, Mark);

Text.prototype.initHandles = function() {
  var prop = util.propSg,
      test = util.test,
      at = util.anchorTarget.bind(util, this, 'handles'),
      x = prop(this, 'x'),
      xc = prop(this, 'xc'),
      x2 = prop(this, 'x2'),
      y = prop(this, 'y'),
      yc = prop(this, 'yc'),
      y2 = prop(this, 'y2'),
      fontSize = prop(this, 'fontSize');

  // This iteration accomplishes the same end as enumerating a `sg.streams`
  // call for `x`, `x2`, etc to handle all x/y position properties
  [{
    delta: DX,
    props: [x, x2, xc]
  }, {
    delta: DY,
    props: [y, y2, yc]
  }].forEach(function(propGroup) {
    propGroup.props.forEach(function(prop) {
      sg.streams(prop, [{
        type: DELTA, expr: test(at(), prop + '+' + propGroup.delta, prop)
      }]);
    });
  });

  // Allow upper-left and lower-right handles to control font size
  sg.streams(fontSize, [
    {type: DELTA, expr: test(at('left') + '&&' + at('top'), fontSize + '-' + DX, fontSize)},
    {type: DELTA, expr: test(at('right') + '&&' + at('bottom'), fontSize + '+' + DX, fontSize)},
    {type: DELTA, expr: test(at('left') + '&&' + at('top'), fontSize + '-' + DY, fontSize)},
    {type: DELTA, expr: test(at('right') + '&&' + at('bottom'), fontSize + '+' + DY, fontSize)}
  ]);
};

module.exports = Text;
