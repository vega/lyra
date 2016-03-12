'use strict';
var dl = require('datalib');

/** @namespace */
var util = {

/**
 * Returns a Vega expression string that tests whether the anchor target
 * has a particular key or is a scenegraph item itself.
 * @param {Object} mark - A Mark object.
 * @param {string} mode - The Lyra manipulator mode.
 * @param {string} [key] - The key of a specific manipulator instance.
 * @return {string} A Vega expression string.
 */
  anchorTarget: function(mark, mode, key) {
    // sg is required here to prevent a circular reference
    var sg = require('../model/signals'),
        ANCHOR = sg.ANCHOR, TARGET = ANCHOR + '.target',
        c = '(' + ANCHOR + '&&' + TARGET + '&&' + TARGET + '.datum &&';

    if (key) {  // Manipulator
      c += TARGET + '.datum.mode === ' + dl.str(mode) + ' &&' +
        TARGET + '.datum.lyra_id === ' + dl.str(mark._id) + '&&' +
        'test(regexp(' + dl.str(key) + ', "i"), ' + TARGET + '.datum.key)';
    }
    else {  // Mark
      c += TARGET + '.mark && ' + TARGET + '.mark.name === ' + dl.str(mark.name);
    }
    return c + ')';
  }
};

module.exports = util;
