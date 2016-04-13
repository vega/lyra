'use strict';
var actions = require('../constants/actions');
var MARK_ADD = actions.MARK_ADD;
var MARK_SET_PARENT = actions.MARK_SET_PARENT;
var MARK_UPDATE_PROPERTY = actions.MARK_UPDATE_PROPERTY;
var counter = require('../util/counter');
var markName = require('../util/markName');
var assign = require('object-assign');

// We pull in all of the mark constructors purely to access their static
// `.getHandleStreams` and `.defaultProperties` methods
var marks = require('../model/primitives/marks');

/**
 * Action creator to create a new mark and add it to the store. (This creator is
 * intended for use with marks, and not other primitives like scales or axes.)
 * @param {Object} markProps - The properties of the mark to create
 * @returns {Object} The MARK_ADD action object
 */
function addMark(markProps) {
  var props = assign({
    _id: markProps._id || counter.global(),
    name: markProps.name || markName(markProps.type)
  }, markProps);
  var action = {
    id: props._id,
    name: props.name,
    type: MARK_ADD,
    props: props,
    streams: marks.getHandleStreams(props)
  };
  return action;
}

function updateMarkProperty(markId, property, value) {
  return {
    type: MARK_UPDATE_PROPERTY,
    id: markId,
    property: property,
    value: value
  };
}

/**
 * Action creator to set one existing mark as the child of another.
 * @param {number} childId - The child mark's ID
 * @param {number} parentId - The parent mark's ID
 * @returns {Object} The MARK_SET_PARENT action object
 */
function setParent(childId, parentId) {
  return {
    type: MARK_SET_PARENT,
    childId: childId,
    parentId: parentId
  };
}

module.exports = {
  addMark: addMark,
  updateMarkProperty: updateMarkProperty,
  setParent: setParent
};
