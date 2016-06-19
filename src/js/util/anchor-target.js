'use strict';
var dl = require('datalib');

/**
 * Returns a Vega expression string that tests whether the anchor target has a
 * particular key or is a scenegraph item itself.
 *
 * @param {Object} mark - A Mark object.
 * @param {string} mode - The Lyra manipulator mode.
 * @param {string} [key] - The key of a specific manipulator instance.
 * @returns {string} A Vega expression string.
 */
module.exports = function(mark, mode, key) {
  // sg is required here to prevent a circular reference
  var sg = require('../model/signals'),
      name = require('../model/export').exportName,
      ANCHOR = sg.ANCHOR,
      TARGET = ANCHOR + '.target',
      expr = '(' + ANCHOR + '&&' + TARGET + '&&' + TARGET + '.datum &&';

  if (key) {
    // Manipulator
    expr += TARGET + '.datum.mode === ' + dl.str(mode) + ' &&' +
      TARGET + '.datum.lyra_id === ' + dl.str(mark._id) + '&&' +
      'test(regexp(' + dl.str(key) + ', "i"), ' + TARGET + '.datum.key)';
  } else {
    // Mark
    expr += TARGET + '.mark && ' +
      TARGET + '.mark.name === ' + dl.str(name(mark.name));
  }
  return expr + ')';
};
