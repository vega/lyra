/**
 * This module holds action creators, some of which create side-effects to bridge
 * the gap between the prior instance-store-oriented architecture and the new
 * redux-store architecture. It could and likely should be fragments into individual
 * modules for clarity and ease of `require()`.
 */
'use strict';

var actions = require('../constants/actions');

/**
 * Return an action object instructing the reducer to add the provided scale
 * to the specified group
 *
 * @param {Object} scale - A Scale primitive instance
 * @param {number} scale._id - The ID of the scale primitive
 * @param {number} parentId [description]
 * @returns {Object} A redux action object
 */
function addScaleToGroup(scale, parentId) {
  return {
    type: actions.RULES_ADD_SCALE_TO_GROUP,
    parentId: parentId,
    scaleId: scale._id
  };
}

/**
 * Return an action object instructing the reducer to set a mark property to
 * the provided value
 *
 * @param {number} markId - The primitive ID for which to set the value
 * @param {string} property - The property on that primitive to overwrite
 * @param {Object} value - The property value object to set
 * @returns {Object} A redux action object
 */
function setProperty(markId, property, value) {
  return {
    type: actions.RULES_SET_PROPERTY,
    id: markId,
    property: property,
    value: value
  };
}

/**
 * Return an action object instructing the reducer to flag a mark property
 * as _disabled
 *
 * @param {number} markId - The primitive ID for which to alter the property
 * @param {string} property - The property on that primitive to flag as disabled
 * @returns {Object} A redux action object
 */
function disableProperty(markId, property) {
  return {
    type: actions.RULES_DISABLE_PROPERTY,
    id: markId,
    property: property
  };
}

/**
 * Return an action object instructing the reducer to reset the provided
 * property to its corresponding signal reference
 *
 * @param {number} markId - The primitive ID for which to reset the property
 * @param {string} property - The property to reset to a signal
 * @returns {Object} A redux action object
 */
function resetProperty(markId, property) {
  return {
    type: actions.RULES_RESET_PROPERTY,
    id: markId,
    property: property
  };
}

module.exports = {
  addScaleToGroup: addScaleToGroup,
  setProperty: setProperty,
  disableProperty: disableProperty,
  resetProperty: resetProperty
};
