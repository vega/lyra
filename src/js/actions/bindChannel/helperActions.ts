import {createStandardAction} from 'typesafe-actions';

/**
 * This module holds action creators, some of which create side-effects to bridge
 * the gap between the prior instance-store-oriented architecture and the new
 * redux-store architecture. It could and likely should be fragments into individual
 * modules for clarity and ease of `require()`.
 */

/**
 * Return an action object instructing the reducer to add the provided scale
 * to the specified group
 *
 * @param {number} scaleId The scale ID
 * @param {number} groupId The ID of the group to add the scale to
 * @returns {Object} A redux action object
 */
export const addScaleToGroup = createStandardAction('ADD_SCALE_TO_GROUP')<number, number>(); // scaleId, groupId

/**
 * Return an action object instructing the reducer to add the provided axis
 * to the specified group
 *
 * @param {number} axisId - The ID of the Lyra axis.
 * @param {number} groupId - The ID of the group to which the axis should be added.
 * @returns {Object} A redux action object
 */
export const addAxisToGroup = createStandardAction('ADD_AXIS_TO_GROUP')<number, number>(); // axisId, groupId

/**
 * Return an action object instructing the reducer to add the provided legend
 * to the specified group
 *
 * @param {number} legendId - The ID of the Lyra legend.
 * @param {number} groupId - The ID of the group to which the legend should be added.
 * @returns {Object} A redux action object
 */
export const addLegendToGroup = createStandardAction('ADD_LEGEND_TO_GROUP')<number, number>(); // legendId, groupId

/**
 * Return an action object instructing the reducer to add the provided interaction
 * to the specified group
 *
 * @param {number} interactionId - The ID of the Lyra interaction.
 * @param {number} groupId - The ID of the group to which the interaction should be added.
 * @returns {Object} A redux action object
 */
export const addInteractionToGroup = createStandardAction('ADD_INTERACTION_TO_GROUP')<number, number>(); // interactionId, groupId
