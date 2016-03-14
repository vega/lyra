'use strict';
// Ensure startsWith polyfill has loaded, to maintain IE compatibility
require('string.prototype.startswith');

var NS = 'lyra_';

/**
 * Ensure a string is properly namespaced with a lyra string prefix
 * @param  {string} name - A property name that may or may not be namespaced
 * @returns {string} A property name that is guaranteed to be namespaced
 */
module.exports = function(name) {
  return name.startsWith(NS) ? name : NS + name;
};
