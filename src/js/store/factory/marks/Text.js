'use strict';

var anchorTarget = require('../../../util/anchor-target'),
    test = require('../../../util/test-if'),
    propSg = require('../../../util/prop-signal');

/**
 * A text mark factory.
 * @returns {Object} Additional default visual properties for a text mark.
 */
function Text() {
  return {
    properties: {
      update: {
        dx: {value: 0, offset: 0},
        dy: {value: 0, offset: 0},
        text: {template: 'Text'},
        align: {value: 'center'},
        baseline: {value: 'middle'},
        font: {value: 'Helvetica'},
        fontSize: {value: 14},
        fontStyle: {value: 'normal'},
        fontWeight: {value: 'normal'},
        angle: {value: 0}
      }
    }
  };
}

/**
 * Return an array of handle signal stream definitions to be instantiated.
 *
 * The returned object is used to initialize the interaction logic for the mark's
 * handle manipulators. This involves setting the mark's property signals
 * {@link https://github.com/vega/vega/wiki/Signals|streams}.
 *
 * @param {Object} text - A text properties object or instantiated text mark
 * @param {number} text._id - A numeric mark ID
 * @param {string} text.type - A mark type, presumably "text"
 * @returns {Object} A dictionary of stream definitions keyed by signal name
 */
Text.getHandleStreams = function(text) {
  var sg = require('../../../ctrl/signals'),
      at = anchorTarget.bind(null, text, 'handles'),
      id = text._id,
      x = propSg(id, 'text', 'x'),
      y = propSg(id, 'text', 'y'),
      fontSize = propSg(id, 'text', 'fontSize'),
      DELTA = sg.DELTA,
      DX = DELTA + '.x',
      DY = DELTA + '.y',
      streams = {};

  streams[x] = [{
    type: DELTA, expr: test(at(), x + '+' + DX, x)
  }];
  streams[y] = [{
    type: DELTA, expr: test(at(), y + '+' + DY, y)
  }];
  // Allow upper-left and lower-right handles to control font size
  streams[fontSize] = [
    {type: DELTA, expr: test(at('left') + '&&' + at('top'), fontSize + '-' + DX, fontSize)},
    {type: DELTA, expr: test(at('right') + '&&' + at('bottom'), fontSize + '+' + DX, fontSize)},
    {type: DELTA, expr: test(at('left') + '&&' + at('top'), fontSize + '-' + DY, fontSize)},
    {type: DELTA, expr: test(at('right') + '&&' + at('bottom'), fontSize + '+' + DY, fontSize)}
  ];
  return streams;
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
