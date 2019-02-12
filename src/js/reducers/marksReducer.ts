/* eslint new-cap:0 */
'use strict';

var dl = require('datalib'),
    Immutable = require('immutable'),
    ACTIONS = require('../actions/Names'),
    ns = require('../util/ns'),
    propSg = require('../util/prop-signal'),
    immutableUtils = require('../util/immutable-utils'),
    get = immutableUtils.get,
    getIn = immutableUtils.getIn,
    set = immutableUtils.set,
    setIn = immutableUtils.setIn,
    deleteKeyFromMap = immutableUtils.deleteKeyFromMap,
    ensureValuePresent = immutableUtils.ensureValuePresent,
    ensureValueAbsent = immutableUtils.ensureValueAbsent;

// Helper reducer to add a mark to the store. Runs the mark through a method to
// convert property values into signal references before setting the mark
// within the store.
// "state" is the marks store state; "action" is an object with a numeric
// `._id`, string `.name`, and object `.props` defining the mark to be created.
function makeMark(action) {
  var def = action.props,
      props = def.properties && def.properties.update;
  return Immutable.fromJS(dl.extend({}, def, {
    properties: {
      update: propSg.convertValuesToSignals(props, def.type, action.id)
    }
  }));
}

// Helper reducer to configure a parent-child relationship between two marks.
// "state" is the marks store state; "action" is an object with a numeric
// `.childId` and either a numeric `.parentId` (for setting a parent) or `null`
// (for clearing a parent, e.g. when removing a mark).
function setParentMark(state, action) {
  // Nothing to do if no child is provided
  if (typeof action.childId === 'undefined') {
    return state;
  }
  var child = get(state, action.childId);
  if (!child) {
    return state;
  }

  var existingParentId = child.get('_parent');

  // If we're deleting a parent but there isn't one to begin with, do nothing
  // (`== null` is used to catch both `undefined` and explicitly `null`)
  if (existingParentId == null && !action.parentId) {
    return state;
  }

  var existingParent = get(state, existingParentId);
  var newParent = action.parentId ? get(state, action.parentId) : action.parentId;

  // Clearing a mark's parent reference
  if (newParent === null) {
    // Second, ensure the child ID has been removed from the parent's marks
    return ensureValueAbsent(
      // First, null out the child's parent reference
      setIn(state, action.childId + '._parent', null),
      existingParentId + '.marks',
      action.childId
    );
  }

  // Moving a mark from one parent to another
  if (existingParent && newParent) {
    // Finally, make sure the child ID is present in the new parent's marks array
    return ensureValuePresent(
      // Next, remove the child ID from the old parent's marks
      ensureValueAbsent(
        // First, update the child's _parent pointer to target the new parent
        setIn(state, action.childId + '._parent', action.parentId),
        existingParentId + '.marks',
        action.childId
      ),
      action.parentId + '.marks',
      action.childId
    );
  }

  // Setting a parent of a previously-parentless mark
  return ensureValuePresent(
    // First, update the child's _parent pointer to target the new parent
    setIn(state, action.childId + '._parent', action.parentId),
    action.parentId + '.marks',
    action.childId
  );
}

/**
 * Move an Axis or Legend from one group to another
 *
 * @param {Object} state - An Immutable state object
 * @param {Object} action - An action object
 * @param {number} action.id - The ID of the Axis or Legend to move
 * @param {number} [action.oldGroupId] - The ID of the group to move it from
 * @param {number} action.groupId - The ID of the group to move it to
 * @param {string} collection - The collection to which this mark belongs,
 * either "legends" or "axes"
 * @returns {Object} A new Immutable state with the requested changes
 */
/* eslint no-unused-vars:0 */
function moveChildToGroup(state, action, collection) {
  var oldGroupCollectionPath = action.oldGroupId + '.' + collection,
      newGroupCollectionPath = action.groupId + '.' + collection;

  // Simple case: add to the new
  if (!action.oldGroupId) {
    return ensureValuePresent(state, newGroupCollectionPath, action.id);
  }

  // Remove from the old and add to the new
  return ensureValuePresent(
    ensureValueAbsent(state, oldGroupCollectionPath, action.id),
    newGroupCollectionPath,
    action.id
  );
}

/**
 * Main marks reducer function, which generates a new state for the marks
 * property store based on the changes specified by the dispatched action object.
 *
 * @param {Object} state - An Immutable.Map state object
 * @param {Object} action - A redux action object
 * @returns {Object} A new Immutable.Map with the changes specified by the action
 */
function marksReducer(state, action) {
  if (typeof state === 'undefined') {
    return new Immutable.Map();
  }

  var markId = action.id;

  if (action.type === ACTIONS.CREATE_SCENE) {
    return set(state, action.id, makeMark(action));
  }

  if (action.type === ACTIONS.ADD_MARK) {
    // Make the mark and .set it at the provided ID, then pass it through a
    // method that will check to see whether the mark needs to be added as
    // a child of another mark
    return setParentMark(set(state, action.id, makeMark(action)), {
      type: ACTIONS.SET_PARENT_MARK,
      parentId: action.props ? action.props._parent : null,
      childId: action.id
    });
  }

  if (action.type === ACTIONS.DELETE_MARK) {
    return deleteKeyFromMap(setParentMark(state, {
      childId: action.id,
      parentId: null
    }), action.id);
  }

  if (action.type === ACTIONS.SET_PARENT_MARK) {
    return setParentMark(state, action);
  }

  if (action.type === ACTIONS.UPDATE_MARK_PROPERTY) {
    return setIn(state, action.id + '.' + action.property,
      Immutable.fromJS(action.value));
  }

  if (action.type === ACTIONS.SET_MARK_VISUAL) {
    return setIn(state, action.id +
      '.properties.update.' + action.property, Immutable.fromJS(action.def));
  }

  if (action.type === ACTIONS.DISABLE_MARK_VISUAL) {
    return setIn(state, action.id +
      '.properties.update.' + action.property + '._disabled', true);
  }

  if (action.type === ACTIONS.RESET_MARK_VISUAL) {
    var markType = getIn(state, markId + '.type'),
        property = action.property;

    return setIn(state, markId + '.properties.update.' + property,
        Immutable.fromJS({signal: propSg(markId, markType, property)}));
  }

  if (action.type === ACTIONS.SET_MARK_EXTENT) {
    return setIn(setIn(state,
      markId + '.properties.update.' + action.oldExtent + '._disabled', true),
      markId + '.properties.update.' + action.newExtent + '._disabled', false);
  }

  if (action.type === ACTIONS.SET_VL_UNIT) {
    return setIn(state, markId + '._vlUnit', Immutable.fromJS(action.spec));
  }

  if (action.type === ACTIONS.BIND_SCALE) {
    return setIn(state, action.id +
      '.properties.update.' + action.property + '.scale', action.scaleId);
  }

  if (action.type === ACTIONS.ADD_SCALE_TO_GROUP) {
    return ensureValuePresent(state, action.groupId + '.scales', action.scaleId);
  }

  if (action.type === ACTIONS.ADD_AXIS_TO_GROUP) {
    return ensureValuePresent(state, action.groupId + '.axes', action.axisId);
  }

  if (action.type === ACTIONS.ADD_LEGEND_TO_GROUP) {
    return ensureValuePresent(state, action.groupId + '.legends', action.legendId);
  }

  if (action.type === ACTIONS.DELETE_GUIDE) {
    state = ensureValueAbsent(state, action.groupId + '.axes', action.id);
    return ensureValueAbsent(state, action.groupId + '.legends', action.id);
  }

  return state;
}

module.exports = marksReducer;
