'use strict';
var ns = require('./ns');

/**
 * Returns the signal name corresponding to the provided arguments.
 *
 * @param {number} id - A mark ID
 * @param {string} type - The type of mark (e.g. "rect" or "text")
 * @param {string} property - The vega mark property to which this signal corresponds
 * @return {string} A well-formed signal name string
 */
module.exports = function(type, id, property) {
  return ns(type + '_' + id + '_' + property);
};
