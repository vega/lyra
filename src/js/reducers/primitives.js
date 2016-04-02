'use strict';

var Immutable = require('immutable');

var actions = require('../constants/actions');
var getIn = require('../util/immutable-utils').getIn;
var setIn = require('../util/immutable-utils').setIn;
var signalRef = require('../util/signal-reference');
var assign = require('object-assign');

function makeMark(action) {
  return Object.keys(action.props).reduce(function(mark, key) {
    if (key === 'properties') {
      return mark.set(key, convertValuesToSignals(action.props[key], action.props.type, action.id));
    }
    return mark.set(key, action.props[key]);
  }, Immutable.Map({
    id: action.id,
    name: action.name
  }));
}

// Helper function to iterate over a mark's .properties hash and convert any .value-
// based property definitions into appropriate signal references
function convertValuesToSignals(properties, type, id) {
  // Reduce the properties into a new object with all values replaced by signal references.
  // First, iterate over all properties of the properties object itself; these will be
  // the selections, e.g. `.update`, `.enter`.
  return Object.keys(properties).reduce(function(convertedProps, selectionKey) {

    // For each selection object, replace all properties with a declared .value with
    // a signal reference pointing at the signal which represents that value (which
    // should exist if the mark was instantiated properly via the addMark store action)
    convertedProps[selectionKey] = Object.keys(properties[selectionKey]).reduce(function(selection, key) {
      if (typeof selection[key].value === 'undefined') {
        return selection;
      }

      // Replace `{value: '??'}` property definition with a ref to its controlling
      // signal, and ensure that _disabled flags are set properly if present
      selection[key] = assign({
        signal: signalRef(type, id, key)
      }, selection[key]._disabled ? {_disabled: true} : {});

      return selection;
    }, assign({}, properties[selectionKey]));

    return convertedProps;
  }, {});
}

function primitivesReducer(state, action) {
  if (typeof state === 'undefined') {
    return new Immutable.Map();
  }

  if (action.type === actions.PRIMITIVE_ADD_MARK) {
    return state.set(action.id, makeMark(action));
  }

  return state;
}

module.exports = primitivesReducer;
