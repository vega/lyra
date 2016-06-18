/**
 * This module holds action creators, some of which create side-effects to bridge
 * the gap between the prior instance-store-oriented architecture and the new
 * redux-store architecture. It could and likely should be fragments into individual
 * modules for clarity and ease of `require()`.
 */
'use strict';

var ADD_SCALE_TO_GROUP  = 'ADD_SCALE_TO_GROUP',
    ADD_AXIS_TO_GROUP   = 'ADD_AXIS_TO_GROUP',
    ADD_LEGEND_TO_GROUP = 'ADD_LEGEND_TO_GROUP',
    RESET_PROPERTY = 'RESET_PROPERTY';

/**
 * Return an action object instructing the reducer to add the provided scale
 * to the specified group
 *
 * @param {number} scaleId The scale ID
 * @param {number} groupId The ID of the group to add the scale to
 * @returns {Object} A redux action object
 */
function addScaleToGroup(scaleId, groupId) {
  return {
    type: ADD_SCALE_TO_GROUP,
    scaleId: scaleId,
    groupId: groupId
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
    type: ADD_AXIS_TO_GROUP,
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
    type: ADD_LEGEND_TO_GROUP,
    oldGroupId: oldGroupId,
    groupId: groupId,
    id: legend._id
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
    type: RESET_PROPERTY,
    id: markId,
    property: property
  };
}

module.exports = {
  // Action Names
  RULES_ADD_SCALE_TO_GROUP: ADD_SCALE_TO_GROUP,
  RULES_ADD_AXIS_TO_GROUP: ADD_AXIS_TO_GROUP,
  RULES_ADD_LEGEND_TO_GROUP: ADD_LEGEND_TO_GROUP,
  RULES_RESET_PROPERTY: RESET_PROPERTY,

  // Action Creators
  addScaleToGroup: addScaleToGroup,
  addAxisToGroup: addAxisToGroup,
  addLegendToGroup: addLegendToGroup,
  resetProperty: resetProperty
};
