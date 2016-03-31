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
 * @classdesc A Lyra Text Mark Primitive.
 * @extends {Mark}
 *
 * @constructor
 */
function Text() {
  Mark.call(this, {
    type: 'text',
    properties: {
      update: {
        strokeWidth: {value: 0},
        x: {value: 80},
        y: {value: 30},
        dx: {value: 0, offset: 0},
        dy: {value: 0, offset: 0},
        // Text-specific properties
        text: {value: 'Text'},
        align: {value: 'center'},
        baseline: {value: 'middle'},
        font: {value: 'Helvetica'},
        fontSize: {value: 14},
        fontStyle: {value: 'normal'},
        fontWeight: {value: 'normal'},
        angle: {value: 0}
      }
    }
  });

  return this;
}

inherits(Text, Mark);

Text.prototype.initHandles = function() {
  var at = anchorTarget.bind(null, this, 'handles'),
      x = propSg(this, 'x'),
      y = propSg(this, 'y'),
      fontSize = propSg(this, 'fontSize');

  sg.streams(x, [{
    type: DELTA, expr: test(at(), x + '+' + DX, x)
  }]);
  sg.streams(y, [{
    type: DELTA, expr: test(at(), y + '+' + DY, y)
  }]);

  // Allow upper-left and lower-right handles to control font size
  sg.streams(fontSize, [
    {type: DELTA, expr: test(at('left') + '&&' + at('top'), fontSize + '-' + DX, fontSize)},
    {type: DELTA, expr: test(at('right') + '&&' + at('bottom'), fontSize + '+' + DX, fontSize)},
    {type: DELTA, expr: test(at('left') + '&&' + at('top'), fontSize + '-' + DY, fontSize)},
    {type: DELTA, expr: test(at('right') + '&&' + at('bottom'), fontSize + '+' + DY, fontSize)}
  ]);
};

/**
 * @property alignments {string[]} Valid align properties for vega text marks
 */
Text.alignments = ['left', 'center', 'right'];

/**
 * @property baselines {string[]} Valid baseline properties for vega text marks
 */
Text.baselines = ['top', 'middle', 'bottom'];

/**
 * @property fonts {string[]} Valid fonts for vega text marks
 */
Text.fonts = ['Helvetica', 'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Trebuchet MS'];

/**
 * @property fontStyles {string[]} Valid font styles for vega text marks
 */
Text.fontStyles = ['normal', 'italic'];

/**
 * @property fontWeights {string[]} Valid font weights for vega text marks
 */
Text.fontWeights = ['normal', 'bold'];

module.exports = Text;
