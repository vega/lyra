'use strict';

/**
 * Exposes a number of utility functions that deal with deep
 * equality.
 */

/**
 * Returns true if objects are deeply equivalent and false
 * otherwise.
 *
 * @param {Object} obj1 - First object to be compared
 * @param {Object} obj2 - Second object to be compared
 * @returns {boolean} Returns true if objects are deeply
 * equivalent and false otherwise.
 */
function isObjectEquiv(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

/**
 * Finds the index of the Object obj in the array arr
 * @param  {Object} obj Object to be found in arr
 * @param  {Array} arr Array obj is trying to find index of
 * @returns {number}  The index of the Object obj in the array arr. Returns -1 if obj is not found in arr.
 */
function indexOf(obj, arr) {
  for (var i = 0; i < arr.length; i++) {
    var element = arr[i];
    if (isObjectEquiv(element, obj)) {
      return i;
    }
  }
  return -1;
}

module.exports = {
  isObjectEquiv: isObjectEquiv,
  indexOf: indexOf
};
