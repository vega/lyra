'use strict';
var ns = require('./ns');

/**
 * Returns the signal name corresponding to the given mark and property.
 * @param {Object} mark - A Mark object.
 * @param {string} property - The name of the property.
 * @returns {string} The name of the signal for the given mark's property.
 */
// TODO: Refactor w/o mark primitive reference.
module.exports = function(mark, property) {
  return ns(mark.type + '_' + mark._id + '_' + property);
};
