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

module.exports = {
  addScaleToGroup: addScaleToGroup
};
