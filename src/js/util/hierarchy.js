'use strict';

var assign = require('object-assign');

/**
 * Get all parent nodes for a given primitive in the Lyra hierarchy, i.e. all
 * groups which may be considered to be ancestors of the provided primitive.
 *
 * @param  {Primitive} primitive - The primitive for which to return ancestors.
 * @returns {Primitive[]} An array of primitives.
 */
function getParents(primitive) {
  var current = primitive.parent && primitive.parent();
  if (!current) {
    return [];
  }
  var parents = [current];
  while (current && current.parent && typeof current.parent === 'function') {
    current = current.parent();
    parents.push(current);
  }
  return parents;
}

/**
 * Pluck the IDs from any group layers within the provided array of primitives.
 *
 * @param {Primitive[]} primitives - An array of primitives
 * @returns {Array} Array of group mark IDs
 */
function getGroupIds(primitives) {
  return primitives.reduce(function(groupIds, primitive) {
    if (primitive.type === 'group') {
      groupIds.push(primitive._id);
    }
    return groupIds;
  }, []);
}

/**
 * Augment an object representing expanded layers by adding the IDs of all
 * primitives in the provided array: this list can be used e.g. to set those
 * layers to "expanded" in the sidebar hierarchy inspector view.
 *
 * @param {Object} expandedLayers - An object of group IDs that are currently
 * in the expanded state.
 * @param {Primitive[]} parentPrimitives - An array of primitives representing
 * groups that should now also be expanded in the hierarchy inspector.
 * @returns {Object} A (new) object containing expanded flags for all previously-
 * expanded layers, and for any layers that are parents of the selected mark.
 */
function getExpandedLayers(expandedLayers, parentPrimitives) {
  var parentIds = parentPrimitives.reduce(function(parents, id) {
    parents[id] = true;
    return parents;
  }, {});
  return assign({}, parentIds, expandedLayers);
}

/**
 * Given a Vega scene graph root node and an array representing the path to a
 * desired item, walk the scene graph to find that desired item and return its
 * Vega scene graph representation.
 *
 * Backlog: this method is opaque and could use a re-write to improve readability.
 *
 * @param  {[type]} item [description]
 * @param  {[type]} path [description]
 * @returns {Object|null} The matched item, or null;
 */
function findInItemTree(item, path) {
  var id, items, i, j, len;
  for (i = path.length - 2; i >= 0; --i) {
    id = path[i];

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
  return item;
}

module.exports = {
  getExpandedLayers: getExpandedLayers,
  getParents: getParents,
  getGroupIds: getGroupIds,
  findInItemTree: findInItemTree
};
