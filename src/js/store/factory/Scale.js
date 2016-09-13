'use strict';

var names = {};

// Scales churn (unused scales are deleted) and thus we want to reuse names
// as much as possible.
function rename(name) {
  var count = 1, str = name;
  while (names[str]) {
    str = name + '' + ++count;
  }
  return (names[str] = 1, str);
}

/**
 * A factory to produce Lyra scales.
 *
 * @param   {string} name   Initial name of the scale; it may be renamed to
 * prevent name collisions.
 * @param   {string} type   Scale type (e.g., ordinal, linear, etc.).
 * @param   {Array[]} domain An array of literal domain values
 * @param   {Array[]|string} range  An array of literal range values, or a
 *                                  preset range string (e.g., width, height).
 * @returns {Object} A Lyra scale definition.
 */
module.exports = function(name, type, domain, range) {
  return {
    _origName: name,
    name: rename(name),
    type: type,

    // Literal domain/ranges.
    domain: domain,
    range:  range,

    // DataRefs, which get compiled from id -> json when exported.
    _domain: [],
    _range:  [],

    nice: undefined,
    round: undefined,
    points: undefined,
    padding: undefined
  };
};
