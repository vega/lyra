'use strict';

var names = {};

// Scales churn (unused scales are deleted) and thus we want to reuse names
// as much as possible.
function rename(name) {
  var count = 1, str = name;
  while (names[str]) {
    str = name + ++count;
  }
  return (names[str] = 1, str);
}

module.exports = function(name, type, domain, range) {
  return {
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
