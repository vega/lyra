/**
 * This module defines methods that can be used to keep a set of discrete,
 * incrementing numeric counters, for use constructing primitive IDs and names.
 *
 * @module util/counter
 */
'use strict';

// Global counter starts at 1
var globalCounter = 1;

// Group starts at 0 so that the scene is group0; other types start at 1
var typeCounters = {
  group: 0
};

/**
 * Get the next value from a globally incrementing counter, useful for generating
 * unique id numbers.
 *
 * @method global
 * @returns {number} The next number in the counter
 */
function getGlobalCounter() {
  return globalCounter++;
}

/**
 * Get the next value from an incrementing counter specific to a particular type
 * of object, useful for creating unique names for marks.
 *
 * @method type
 * @param {string} type - The type of counter to return, e.g.
 * @returns {number|void} The next number in the counter for the provided type,
 * or "undefined" (if invoked with an invalid type)
 */
function getTypeCounter(type) {

  /* eslint consistent-return: 0 */
  if (!type) {
    return;
  }

  if (typeof typeCounters[type] === 'undefined') {
    typeCounters[type] = 1;
  }

  return typeCounters[type]++;
}

/**
 * Reset the counters to their initial values (useful for starting a test suite
 * with a clean slate).
 * @return {void}
 */
function reset() {
  globalCounter = 1;
  Object.keys(typeCounters).forEach(function(key) {
    typeCounters[key] = key === 'group' ? 0 : 1;
  });
}

module.exports = {
  global: getGlobalCounter,
  type: getTypeCounter,
  reset: reset
};
