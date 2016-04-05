/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable');

var actions = require('../constants/actions');
var ns = require('../util/ns');
var signalRef = require('../util/signal-reference');
var immutableUtils = require('../util/immutable-utils');
var get = immutableUtils.get;
var set = immutableUtils.set;
var setIn = immutableUtils.setIn;
var ensureValuePresent = immutableUtils.ensureValuePresent;
var ensureValueAbsent = immutableUtils.ensureValueAbsent;
var assign = require('object-assign');

// Helper function to iterate over a mark's .properties hash and convert any .value-
// based property definitions into appropriate signal references
function convertValuesToSignals(properties, type, id) {
  var updateProps = properties && properties.update;

  if (!updateProps) {
    // No property values to initialize as signals; return properties as-is
    return properties;
  }

  // Reduce the properties into a new object with all values replaced by signal
  // references: iterate over all of the `properties.update`'s keys. For each property,
  // replace any declared .value with a signal reference pointing at the signal which
  // will represent that property (which should exist if the mark was instantiated
  // properly via the addMark store action).
  return assign({}, properties, {
    update: Object.keys(updateProps).reduce(function(selection, key) {
      if (typeof selection[key].value === 'undefined') {
        return selection;
      }

      // Replace `{value: '??'}` property definition with a ref to its controlling
      // signal, and ensure that _disabled flags are set properly if present
      selection[key] = assign({
        signal: signalRef(type, id, key)
      }, selection[key]._disabled ? {_disabled: true} : {});

      return selection;
    }, assign({}, updateProps))
  });
}

function makeMark(action) {
  return Object.keys(action.props).reduce(function(mark, key) {
    if (key === 'properties') {
      return mark.set(key, Immutable.fromJS(
        convertValuesToSignals(action.props[key], action.props.type, action.id))
      );
    }
    return set(mark, key, action.props[key]);
  }, Immutable.Map({
    _id: action.id,
    name: action.name
  }));
}

// @TODO: This does not yet handle the case of UN-setting a parent
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
  var newParent = get(state, action.parentId);

  // Clearing a mark's parent reference
  if (newParent === null) {
    // Second, ensure the child ID has been removed from
    return ensureValueAbsent(
      // First, null out the child's parent reference
      set(state, action.childId, setIn(child, '_parent', null)),
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
        set(state, action.childId, setIn(child, '_parent', action.parentId)),
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

function primitivesReducer(state, action) {
  if (typeof state === 'undefined') {
    return new Immutable.Map();
  }

  if (action.type === actions.PRIMITIVE_ADD_MARK) {
    // Make the mark and .set it at the provided ID, then pass it through a
    // method that will check to see whether the mark needs to be added as
    // a child of another mark
    return setParentMark(set(state, action.id, makeMark(action)), {
      type: actions.PRIMITIVE_SET_PARENT,
      parentId: action.props ? action.props._parent : null,
      childId: action.id
    });
  }

  if (action.type === actions.CREATE_SCENE) {
    // Set the scene, converting its width and height into their signal equivalents.
    // `assign()` is used to avoid mutating the action object, which may be utilized
    // in other reducers as well.
    return set(state, action.id, makeMark(assign({}, action, {
      props: assign({}, action.props, {
        width: {signal: ns('vis_width')},
        height: {signal: ns('vis_height')}
      })
    })));
  }

  if (action.type === actions.PRIMITIVE_SET_PARENT) {
    return setParentMark(state, action);
  }

  return state;
}

module.exports = primitivesReducer;
