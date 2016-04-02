'use strict';

var counter = require('./counter');

/**
 * Generate the default name for a mark of a specific type.
 *
 * @param {string} type - The type of mark, e.g. "text" or "rect"
 * @returns {string} A string of format "marktype_num", where "num" is a number
 * not known to have been used for a mark of that type
 */
function markName(type) {
  return type + '_' + counter.type(type);
}

module.exports = markName;
