'use strict';

var Immutable = require('immutable');

// Coerce a key to a string so that our immutable utilities work consistently:
// Immutable permits us to use numbers, objects, etc as keys, but supporting
// path strings like 'collection.22.prop' requires us to always use strings.
// (This is also more consistent: `Immutable.fromJS()` also treats "numeric"
// keys as strings, because in a JS object all keys ARE strings.)
function toStr(key) {
  return '' + key;
}

function pathToArr(pathStr) {
  return pathStr.split('.');
}

/**
 * Return an item from a nested tree of immutable structures, selecting the
 * "present" value in the event that any level of the provided structure conforms
 * to Redux's history state shape conventions (see "Implementing Undo History"
 * in the Redux documentation).
 *
 * Test cases to write:
 * - Basic shallow undoable store
 * - Nested undoable store
 * - Store with value "present"
 *
 * @param {Immutable.Map|Immutable.List|Immutable.OrderedMap} structure - An
 * immutable data store exposing the .getIn API
 * @param {string} pathStr - A path string, e.g. "parentProp.childProp"
 * @returns {*} The value of the [present history state of the] specified
 * structure's sub-item at the requested path
 */
function getIn(structure, pathStr) {
  if (!structure) {
    return;
  }
  var pathArr = pathToArr(pathStr);
  return pathArr.reduce(function(substructure, pathKey) {
    if (typeof substructure.get !== 'function') {
      return substructure;
    }
    var val = substructure.get(pathKey);
    if (!val) {
      return val;
    }
    if (val && val.present) {
      // This state is structured for history: return the present value
      return val.present;
    }
    return val;
  }, structure.present ? structure.present : structure);
}

function setIn(structure, pathStr, value) {
  return structure.setIn(pathToArr(pathStr), value);
}

function get(structure, key) {
  if (!structure) {
    return;
  }
  return structure.get(toStr(key));
}

function set(structure, key, value) {
  return structure.set(toStr(key), value);
}

/**
 * Ensure a value exists in an array within the specified array within the state.
 *
 * Most commonly this should be a number, string, or other literal value: if
 * you need to ensure the existence of an object or array within an array a
 * custom function is advised, because this method relies on object equality
 * to determine equivalence.
 *
 * If the provided path string does not resolve to an array, nothing is changed.
 *
 * @param  {Object} state - An Immutable iterable object (map, list, etc)
 * @param  {string} arrPathStr - A path designating the location of the array to
 * modify, e.g. 'prop.child.arr'
 * @param  {*} valToAdd - A value to ensure exists (through literal equality)
 * within the specified array
 * @returns {Object} A state object in which the specified array contains the
 * provided value
 */
function ensureValuePresent(state, arrPathStr, valToAdd) {
  var arr = getIn(state, arrPathStr);
  if (!arr || !arr.toJS) {
    return state;
  }
  var vals = arr.toJS();
  if (!Array.isArray(vals)) {
    return state;
  }
  return vals.indexOf(valToAdd) < 0 ?
    setIn(state, arrPathStr, Immutable.fromJS(vals.concat([valToAdd]))) :
    state;
}

/**
 * Ensure a value is not present within the specified array within the state.
 *
 * Most commonly this should be used to removea number, string, or other literal
 * value: if you need to remove an object or array within an array a custom
 * function is advised, because this method relies on object equality to
 * determine equivalence.
 *
 * If the provided path string does not resolve to an array, nothing is changed.
 *
 * @param  {Object} state - An Immutable iterable object (map, list, etc)
 * @param  {string} arrPathStr - A path designating the location of the array to
 * modify, e.g. 'prop.child.arr'
 * @param  {*} valToRemove - A value to remove from the specified array
 * @returns {Object} A state object in which the specified array does not
 * contain the provided value
 */
function ensureValueAbsent(state, arrPathStr, valToRemove) {
  var arr = getIn(state, arrPathStr);
  if (!arr || !arr.toJS) {
    return state;
  }
  var vals = arr.toJS();
  if (!Array.isArray(vals)) {
    return state;
  }
  return vals.indexOf(valToRemove) >= 0 ?
    setIn(state, arrPathStr, Immutable.fromJS(vals.filter(function(val) {
      return val !== valToRemove;
    }))) :
    state;
}

module.exports = {
  get: get,
  set: set,
  getIn: getIn,
  setIn: setIn,
  ensureValuePresent: ensureValuePresent,
  ensureValueAbsent: ensureValueAbsent
};
