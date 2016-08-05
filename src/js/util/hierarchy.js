'use strict';

var Bounds = require('vega-scenegraph').Bounds,
    store = require('../store'),
    imutils = require('./immutable-utils'),
    getIn = imutils.getIn,
    getInVis = imutils.getInVis;

/**
 * Find the parent item for a given mark.
 *
 * @param {ImmutableMap} mark  - A mark for which to return the parent mark
 * @param {ImmutableMap} [state] - Optional redux state -- passed in for testing,
 * otherwise uses the Lyra store.
 * @returns {ImmutableMap|null} The requested mark, if present, else null
 */
function getParent(mark, state) {
  state = state || store.getState();
  return getInVis(state, 'marks.' + mark.get('_parent')) || null;
}

/**
 * Get all parent nodes for a given primitive in the Lyra hierarchy, i.e. all
 * groups which may be considered to be ancestors of the provided primitive.
 *
 * @param  {ImmutableMap} primitive - The primitive for which to return ancestors.
 * @param {ImmutableMap} [state] - Optional redux state -- passed in for testing,
 * otherwise uses the Lyra store.
 * @returns {ImmutableMap[]} An array of primitives.
 */
function getParents(primitive, state) {
  if (!primitive) {
    return [];
  }
  var current = primitive.get('_parent') && getParent(primitive, state);
  if (!current) {
    return [];
  }
  var parents = [current];
  while (current && current.get('_parent')) {
    current = getParent(current, state);
    if (current) {
      parents.push(current);
    }
  }
  return parents;
}

/**
 * Pluck the IDs from any group layers within the provided array of primitives.
 *
 * @param {ImmutableMap[]} primitives - An array of primitives
 * @returns {Array} Array of group mark IDs
 */
function getGroupIds(primitives) {
  return primitives.reduce(function(groupIds, primitive) {
    if (primitive.get('type') === 'group') {
      groupIds.push(primitive.get('_id'));
    }
    return groupIds;
  }, []);
}

/**
 * Wrap a commonly chained sequence of hierarchy inquiries: take a primitive,
 * find all its parents, and return an array of those parents' IDs.
 *
 * @param {number} markId - The ID of a mark for which to return parent layer IDs.
 * @param {ImmutableMap} [state] - Optional redux state -- passed in for testing,
 * otherwise uses the Lyra store.
 * @returns {number[]} An array of the (lyra) IDs of the primitive's parent layers.
 */
function getParentGroupIds(markId, state) {
  state = state || store.getState();
  return getGroupIds(getParents(getInVis(state, 'marks.' + markId), state));
}

/**
 * Find the ID of the nearest group or scene which is or contains the provided
 * primitive mark ID.
 *
 * @param {number} id - A numeric primitive ID
 * @param {ImmutableMap} [state] - Optional redux state -- passed in for testing,
 * otherwise uses the Lyra store.
 * @returns {number|null} The ID of the nearest group or scene, if found, or null
 * if the mark is invalid or there was no group or scene ancestor available
 */
function getClosestGroupId(id, state) {
  state = state || store.getState();
  var markId = id || getIn(state, 'inspector.encodings.selectedId'),
      mark = getInVis(state, 'marks.' + markId);

  if (!mark) {
    return getInVis(state, 'scene.id');
  }

  // If mark is a group or scene, return it as-is
  if (mark.get('type') === 'group' || mark.get('type') === 'scene') {
    return mark.get('_id');
  }

  // If mark is not a group or scene, but exists, check its parents
  return getClosestGroupId(mark.get('_parent'), state);
}

/**
 * Given a Vega scene graph root node and an array representing the path to a
 * desired item, walk the scene graph to find that desired item and return its
 * Vega scene graph representation.
 *
 * @param  {Object} item The root vega-scenegraph Item.
 * @param  {number[]} path An array of Lyra Primitive IDs to walk down.
 * @returns {Object|null} The matched item, or null;
 */
function findInItemTree(item, path) {
  var vis = document.querySelector('.vis-container'),
      offset = {x: 0, y: 0},
      itemX = +Number.MAX_VALUE, itemY = +Number.MAX_VALUE,
      id, items, i, j, len, bounds, closer, intersects, closest;

  for (i = path.length - 1; i >= 0; --i) {
    id = path[i];
    offset.x += +item.x || 0;
    offset.y += +item.y || 0;

    for (items = item.items, j = 0, len = items.length; j < len; ++j) {
      // The Vega scene graph structure alternates between definition nodes
      // which hold the vega spec for a mark, and each of the item nodes (one
      // per visualized element). This logic handles that alternation.
      item = items[j].def.lyra_id === id ? items[j].items[0] : null;
      if (item !== null) {
        break;
      }
    }

    if (item === null) {
      break;
    }
  }

  // Now that we have a scenegraph item corresponding to our selected mark, we
  // want to select an item within the visible viewport.
  var viewport = new Bounds({
    x1: vis.scrollLeft, x2: 300 + vis.scrollLeft,
    y1: vis.scrollTop, y2: 200 + vis.scrollTop
  });

  if (item && item.mark.items.length > 1) {
    for (i = 0, items = item.mark.items, len = items.length; i < len; ++i) {
      item = items[i];
      bounds = item.bounds;
      closer = bounds && (bounds.x1 < itemX || bounds.y1 < itemY);

      if (!bounds) {
        break;
      }

      // Select the item if its entirely enclosed within our viewport.
      // Otherwise, find the closest item that intersects it.
      // And in the worst case, select the item closest to one of the edges.
      if (viewport.encloses(bounds)) {
        closest = intersects = null;
        break;
      } else if (viewport.intersects(bounds) && closer) {
        intersects = item;
        itemX = bounds.x1;
        itemY = bounds.y1;
      } else if (closer) {
        closest = item;
        itemX = bounds.x1;
        itemY = bounds.y1;
      }
    }
  }

  return intersects || closest || item;
}

module.exports = {
  getParent: getParent,
  getParentGroupIds: getParentGroupIds,
  getParents: getParents,
  getGroupIds: getGroupIds,
  getClosestGroupId: getClosestGroupId,
  findInItemTree: findInItemTree
};
