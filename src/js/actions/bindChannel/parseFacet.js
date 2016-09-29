'use strict';

var markActions = require('../markActions'),
    addMark = markActions.addMark,
    setParent = markActions.setParent,
    Mark = require('../../store/factory/Mark'),
    getInVis = require('../../util/immutable-utils').getInVis;

/**
 * To allow shared guides between facets, we want to ensure that the faceted
 * group is nested at least two levels deep (i.e., there is a non-scene group
 * mark above it). This function injects an additional group if necessary.
 *
 * @param {Function} dispatch  Redux dispatch function.
 * @param {ImmutableMap} state Redux store.
 * @param  {number} markId   The ID of the mark whose property will be bound.
 * @returns {number} The ID of the group to be faceted.
 */
function injectGroup(dispatch, state, markId) {
  var mark  = getInVis(state, 'marks.' + markId),
      group = getInVis(state, 'marks.' + mark.get('_parent')),
      gid = group.get('_id'),
      scene = getInVis(state, 'scene.id');

  if (group.get('_parent') !== scene) {
    return gid;
  }

  group = addMark(Mark('group', {_parent: gid}));
  dispatch(group);
  dispatch(setParent(markId, group.id));
  return group.id;
}

module.exports = {
  injectGroup: injectGroup
};
