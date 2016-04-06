'use strict';

var ctors = {
  area: require('./Area'),
  group: require('./Group'),
  line: require('./Line'),
  rect: require('./Rect'),
  scene: require('./Scene'),
  symbol: require('./Symbol'),
  text: require('./Text')
};

// Helper method
function warnIfInvalidType(type) {
  if (!ctors[type]) {
    console.warn('unrecognized mark type "' + type + '"');
  }
}

/**
 * Return the constructor for a provided type.
 *
 * @param {string} type - The mark type, e.g. "rect" or "line"
 * @return {Function|void} A constructor function, or undefined if no
 * constructor is available for that type.
 */
function getConstructor(type ) {
  warnIfInvalidType(type);
  return ctors[type];
}

/**
 * Return the default properties object for a provided type.
 *
 * @param {string} type - The mark type, e.g. "rect" or "line"
 * @param {Object} [overrides] - An optional property overrides object
 * @return {Object} A properties hash
 */
function getDefaults(type, overrides) {
  warnIfInvalidType(type);
  return ctors[type] && ctors[type].defaultProperties(overrides);
}

module.exports = {
  getConstructor: getConstructor,
  getDefaults: getDefaults
};
