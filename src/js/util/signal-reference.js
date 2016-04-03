'use strict';
var ns = require('./ns');

/**
 * Returns the signal name corresponding to the provided arguments.
 *
 * @param {string} type - The type of mark (e.g. "rect" or "text")
 * @param {number} id - A mark ID
 * @param {string} property - The vega mark property to which this signal corresponds
 * @returns {string} A well-formed signal name string
 */
module.exports = function(type, id, property) {
  return ns(type + '_' + id + '_' + property);
};
