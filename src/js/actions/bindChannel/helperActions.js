/**
 * This module holds action creators, some of which create side-effects to bridge
 * the gap between the prior instance-store-oriented architecture and the new
 * redux-store architecture. It could and likely should be fragments into individual
 * modules for clarity and ease of `require()`.
 */
'use strict';

var ADD_SCALE_TO_GROUP  = 'ADD_SCALE_TO_GROUP',
    ADD_AXIS_TO_GROUP   = 'ADD_AXIS_TO_GROUP',
    ADD_LEGEND_TO_GROUP = 'ADD_LEGEND_TO_GROUP';

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
 * @param {number} axisId - The ID of the Lyra axis.
 * @param {number} groupId - The ID of the group to which the axis should be added.
 * @returns {Object} A redux action object
 */
function addAxisToGroup(axisId, groupId) {
  return {
    type: ADD_AXIS_TO_GROUP,
    axisId: axisId,
    groupId: groupId
  };
}

/**
 * Return an action object instructing the reducer to add the provided legend
 * to the specified group
 *
 * @param {number} legendId - The ID of the Lyra legend.
 * @param {number} groupId - The ID of the group to which the legend should be added.
 * @returns {Object} A redux action object
 */
function addLegendToGroup(legendId, groupId) {
  return {
    type: ADD_LEGEND_TO_GROUP,
    legendId: legendId,
    groupId: groupId
  };
}

module.exports = {
  // Action Names
  ADD_SCALE_TO_GROUP: ADD_SCALE_TO_GROUP,
  ADD_AXIS_TO_GROUP: ADD_AXIS_TO_GROUP,
  ADD_LEGEND_TO_GROUP: ADD_LEGEND_TO_GROUP,

  // Action Creators
  addScaleToGroup: addScaleToGroup,
  addAxisToGroup: addAxisToGroup,
  addLegendToGroup: addLegendToGroup
};
