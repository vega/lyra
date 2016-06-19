'use strict';
var ns = require('./ns');

/**
 * Returns the signal name corresponding to the given mark and property.
 * @param {number} markId The Lyra ID for a given mark.
 * @param {string} markType The type of the mark (area, group, line, rect, symbol or text).
 * @param {string} property The name of the mark property determined by the signal.
 * @returns {string} The name of the signal for the given mark's property.
 */
module.exports = function(markId, markType, property) {
  return ns(markType + '_' + markId + '_' + property);
};
