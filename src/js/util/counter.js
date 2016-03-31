'use strict';
/**
 * This module defines methods that can be used to keep a set of discrete,
 * incrementing numeric counters, for use constructing primitive IDs and names.
 *
 * @module util/counter
 */

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
 * @return {number} The next number in the counter
 */
function global() {
  return globalCounter++;
}

/**
 * Get the next value from an incrementing counter specific to a particular type
 * of object, useful for creating unique names for marks.
 *
 * @param {string} type - The type of counter to return, e.g.
 * @return {number} The next number in the counter for the provided type
 */
function type(type) {
  if (!type) {
    return;
  }
  if (typeof typeCounters[type] === 'undefined') {
    typeCounters[type] = 1;
  }
  return typeCounters[type]++;
}

module.exports = {
  global: global,
  type: type
};
