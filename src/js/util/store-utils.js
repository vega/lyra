/**
 * This module defines utility functions which operate by querying the redux
 * store state and returning a value deduced from that state. They should
 * all take a store as a first property in order to keep the utilities pure.
 *
 * @module store-utils
 */
'use strict';

var getInVis = require('./immutable-utils').getInVis;

/**
 * Find the ID of the nearest group or scene which is or contains the provided
 * primitive mark ID.
 *
 * @param {Object} state - An immutable state object
 * @param {number} id - A numeric primitive ID
 * @returns {number|null} The ID of the nearest group or scene, if found, or null
 * if the mark is invalid or there was no group or scene ancestor available
 */
function getClosestGroupId(state, id) {
  var markState = getInVis(state, 'marks.' + id),
      mark = markState && markState.toJS();

  if (!mark) {
    return getInVis(state, 'scene.id');
  }

  // If mark is a group or scene, return it as-is
  if (mark.type === 'group' || mark.type === 'scene') {
    return mark._id;
  }

  // If mark is not a group or scene, but exists, check its parents
  return getClosestGroupId(state, mark._parent);
}

/**
 * Helper method to locate a scale corresponding to a provided property or
 * channel for a given mark
 *
 * @param {Object} state - An immutable state object
 * @param {number} id - The ID of the primitive being bound
 * @param {string} property - The Lyra mark's property that was just bound.
 * @param {string} channel - The corresponding Vega-Lite channel
 * @returns {number|void} The ID of the matched scale, or undefined
 */
function getGuideScale(state, id, property, channel) {
  var updatePropsState = getInVis(state, 'marks.' + id + '.properties.update');

  if (!updatePropsState) {
    return;
  }

  var updateProps = updatePropsState.toJS(),
      prop = updateProps[property] || updateProps[channel];

  return prop.scale;
}

module.exports = {
  getClosestGroupId: getClosestGroupId,
  getGuideScale: getGuideScale
};
