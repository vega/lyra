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
 * @param {number} groupId [description]
 * @returns {Object} A redux action object
 */
function addScaleToGroup(scale, groupId) {
  return {
    type: actions.RULES_ADD_SCALE_TO_GROUP,
    groupId: groupId,
    id: scale._id
  };
}

/**
 * Return an action object instructing the reducer to add the provided axis
 * to the specified group
 *
 * @param {Object} axis - An Axis primitive instance
 * @param {number} axis._id - The ID of the Axis primitive
 * @param {number} groupId - The ID of the mark to which the axis should be added
 * @returns {Object} A redux action object
 */
function addAxisToGroup(axis, groupId) {
  // Side effect: update the axis's parent. Since axes are not yet deduced from
  // the store, the reducer has no ability to make this change. Store the old
  // parent (which may be undefined) so that it can be passed in (the reducer
  // must be able to move the axis from the old parent to the new).
  var oldGroupId = axis._parent;
  axis._parent = groupId;
  return {
    type: actions.RULES_ADD_AXIS_TO_GROUP,
    oldGroupId: oldGroupId,
    groupId: groupId,
    id: axis._id
  };
}

/**
 * Return an action object instructing the reducer to add the provided legend
 * to the specified group
 *
 * @param {Object} legend - A Legend primitive instance
 * @param {number} legend._id - The ID of the Legend primitive
 * @param {number} groupId - The ID of the mark to which the legend should be added
 * @returns {Object} A redux action object
 */
function addLegendToGroup(legend, groupId) {
  // Side effect: update the legend's parent. Since axes are not yet deduced from
  // the store, the reducer has no ability to make this change. Store the old
  // parent (which may be undefined) so that it can be passed in (the reducer
  // must be able to move the legend from the old parent to the new).
  var oldGroupId = legend._parent;
  legend._parent = groupId;
  return {
    type: actions.RULES_ADD_LEGEND_TO_GROUP,
    oldGroupId: oldGroupId,
    groupId: groupId,
    id: legend._id
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
 * as not _disabled
 *
 * @param {number} markId - The primitive ID for which to alter the property
 * @param {string} property - The property on that primitive to enable
 * @returns {Object} A redux action object
 */
function enableProperty(markId, property) {
  return {
    type: actions.RULES_ENABLE_PROPERTY,
    id: markId,
    property: property
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
  addAxisToGroup: addAxisToGroup,
  addLegendToGroup: addLegendToGroup,
  setProperty: setProperty,
  enableProperty: enableProperty,
  disableProperty: disableProperty,
  resetProperty: resetProperty
};
