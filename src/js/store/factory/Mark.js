/* eslint no-undefined:0 */
'use strict';

var dl = require('datalib'),
    counter = require('../../util/counter');

var marks = {
  area: require('./marks/Area'),
  group: require('./marks/Group'),
  line: require('./marks/Line'),
  rect: require('./marks/Rect'),
  scene: require('./marks/Scene'),
  symbol: require('./marks/Symbol'),
  text: require('./marks/Text')
};

function name(type) {
  return type.capitalize() + ' ' + counter.type('marks');
}

function throwIfInvalidType(type) {
  if (!marks[type]) {
    throw Error('unrecognized mark type "' + type + '"');
  }
}

// Default visual properties for marks.
var defaults = {
  x: {value: 50},
  y: {value: 50},
  fill: {value: '#4682b4'},
  fillOpacity: {value: 1},
  stroke: {value: '#000000'},
  strokeWidth: {value: 0.25}
};

/**
 * A factory to produce Lyra marks.
 *
 * @param   {string} type   A mark type (area, group, line, rect, scene, symbol or text).
 * @param   {Object} props  Default visual properties of the mark.
 * @returns {Object} A Lyra mark definition.
 */
function Mark(type, props) {
  throwIfInvalidType(type);
  var mark = marks[type]();

  return dl.extend(mark, props, {
    name: props && props.name || name(type),
    type: type,
    properties: {
      update: extend({}, defaults, mark.properties.update)
    }
  });
}

/**
 * Return an object of signal stream definitions for handle manipulators for the
 * specified mark.
 *
 * @param {Object} mark - A mark properties object or instantiated mark
 * @param {number} mark._id - A numeric mark ID
 * @param {string} mark.type - A mark type, such as "text" or "rect"
 * @returns {Object} A dictionary of signal stream definitions
 */
Mark.getHandleStreams = function(mark) {
  var markType = mark.type;
  return marks[markType].getHandleStreams(mark);
};

/**
 * Custom extend method that deletes undefined keys.
 * @param   {Object} obj Javascript object to extend
 * @returns {Object}     Extended Javascript object.
 */
function extend(obj) {
  for (var x, key, i = 1, len = arguments.length; i < len; ++i) {
    x = arguments[i];
    for (key in x) {
      obj[key] = x[key];
      if (x[key] === undefined) {
        delete obj[key];
      }
    }
  }
  return obj;
}

module.exports = Mark;
