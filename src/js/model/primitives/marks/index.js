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
 * @returns {Function|void} A constructor function, or undefined if no
 * constructor is available for that type.
 */
function getConstructor(type) {
  warnIfInvalidType(type);
  return ctors[type];
}

/**
 * Return the default properties object for a provided type.
 *
 * @param {string} type - The mark type, e.g. "rect" or "line"
 * @param {Object} [overrides] - An optional property overrides object
 * @returns {Object} A properties hash
 */
function getDefaults(type, overrides) {
  warnIfInvalidType(type);
  return ctors[type] && ctors[type].defaultProperties(overrides);
}

/**
 * Return an object of handle stream signal definitions for the specified
 * primitive object.
 *
 * @param {Object} props - A mark properties object or instantiated mark
 * @param {number} props._id - A numeric mark ID
 * @param {string} props.type - A mark type, such as "text" or "rect"
 * @returns {Object} A dictionary of stream signal definitions
 */
function getHandleStreams(props) {
  var type = props.type;
  warnIfInvalidType(type);
  if (ctors[type] && typeof ctors[type].getHandleStreams === 'function') {
    return ctors[type].getHandleStreams(props);
  }
  return {};
}

module.exports = {
  getConstructor: getConstructor,
  getDefaults: getDefaults,
  getHandleStreams: getHandleStreams
};
