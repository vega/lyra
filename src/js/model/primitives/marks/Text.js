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
 * @param {Object} [props] - An object defining this mark's properties
 * @param {string} props.type - The type of mark (should be 'text')
 * @param {Object} props.properties - A Vega mark properties object
 * @param {string} [props.name] - The name of the mark
 * @param {number} [props._id] - A unique mark ID
 */
function Text(props) {
  Mark.call(this, props || Text.defaultProperties());
}

inherits(Text, Mark);

/**
 * Returns an object representing the default values for a rect text, containing
 * a type string and a Vega mark properties object.
 *
 * @static
 * @param {Object} [props] - Props to merge into the returned default properties object
 * @returns {Object} The default mark properties
 */
Text.defaultProperties = function(props) {
  return dl.extend({
    type: 'text',
    // name: 'text' + '_' + counter.type('text'); // Assign name in the reducer
    // _id: assign ID in the reducer
    properties: Mark.mergeProperties(Mark.defaultProperties(), {
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
    })
  }, props);
};

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
