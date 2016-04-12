/* eslint new-cap:0 */
'use strict';

var Immutable = require('immutable');

var actions = require('../constants/actions');
var ns = require('../util/ns');
var signalRef = require('../util/signal-reference');
var immutableUtils = require('../util/immutable-utils');
var get = immutableUtils.get;
var getIn = immutableUtils.getIn;
var set = immutableUtils.set;
var setIn = immutableUtils.setIn;
var ensureValuePresent = immutableUtils.ensureValuePresent;
var ensureValueAbsent = immutableUtils.ensureValueAbsent;
var assign = require('object-assign');

// Helper function to iterate over a mark's .properties hash and convert any .value-
// based property definitions into appropriate signal references.
// "properties" is the properties hash from the dispatched action; "type" is a string
// type; and "id" is a numeric mark ID (type and ID are used to create the name of
// the signal that will be referenced in place of values in the properties hash).
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

// Helper reducer to add a mark to the store. Runs the mark through a method to
// convert property values into signal references before setting the primitive
// within the store.
// "state" is the primitives store state; "action" is an object with a numeric
// `._id`, string `.name`, and object `.props` defining the mark to be created.
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

// Helper reducer to configure a parent-child relationship between two marks.
// "state" is the primitives store state; "action" is an object with a numeric
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

/**
 * Set a property value in the store, overwriting any prior value that had
 * been held by that property.
 *
 * @private
 * @param {Object} state - An immutable state object
 * @param {number} id - A numeric primitive ID
 * @param {string} property - A string property key (to be set on the mark's
 * properties.update selection)
 * @param {Object} value - The new property value to set
 * @returns {Object} A new immutable state with the requested changes
 */
function setProperty(state, id, property, value) {
  var propPath = id + '.properties.update.' + property;

  return setIn(state, propPath, assign({}, value));
}

function disableProperty(state, id, property) {
  var propPath = id + '.properties.update.' + property,
      currentPropValue = getIn(state, propPath).toJS();

  return setIn(state, propPath, assign({}, currentPropValue, {
    _disabled: true
  }));
}

function resetProperty(state, id, property) {
  var markType = getIn(state, id + '.type');

  return setProperty(state, id, property, {
    signal: signalRef(markType, id, property)
  });
}

/**
 * Main primitives reducer function, which generates a new state for the
 * primitives (marks) property store based on the changes specified by the
 * dispatched action object.
 *
 * @param {Object} state - An Immutable.Map state object
 * @param {Object} action - A redux action object
 * @returns {Object} A new Immutable.Map with the changes specified by the action
 */
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

  if (action.type === actions.PRIMITIVE_DELETE_MARK) {
    // primitive store is keyed with strings: ensure ID is a string
    return setParentMark(state, {
      childId: action.markId,
      parentId: null
    }).set('' + action.markId, null);
  }

  if (action.type === actions.PRIMITIVE_SET_PARENT) {
    return setParentMark(state, action);
  }

  if (action.type === actions.RULES_ADD_SCALE_TO_GROUP) {
    return ensureValuePresent(state, action.parentId + '.scales', action.scaleId);
  }

  if (action.type === actions.RULES_SET_PROPERTY) {
    return setProperty(state, action.id, action.property, action.value);
  }

  if (action.type === actions.RULES_DISABLE_PROPERTY) {
    return disableProperty(state, action.id, action.property);
  }

  if (action.type === actions.RULES_RESET_PROPERTY) {
    return resetProperty(state, action.id, action.property);
  }

  return state;
}

module.exports = primitivesReducer;
