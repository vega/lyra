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

function getIn(structure, pathStr) {
  if (!structure) {
    return;
  }
  return structure.getIn(pathToArr(pathStr));
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
  var vals = typeof arr.toJS === 'function' ? arr.toJS() : arr;
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
 * @param  {Object} state - An Immutable iterable object (map, list, etc)
 * @param  {string} arrPathStr - A path designating the location of the array to
 * modify, e.g. 'prop.child.arr'
 * @param  {*} valToRemove - A value to remove from the specified array
 * @returns {Object} A state object in which the specified array does not
 * contain the provided value
 */
function ensureValueAbsent(state, arrPathStr, valToRemove) {
  var arr = getIn(state, arrPathStr);
  var vals = typeof arr.toJS === 'function' ? arr.toJS() : arr;
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
