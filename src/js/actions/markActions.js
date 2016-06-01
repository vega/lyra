'use strict';
var actions = require('../constants/actions');
var ADD_MARK = actions.ADD_MARK;
var SET_PARENT_MARK = actions.SET_PARENT_MARK;
var UPDATE_MARK_PROPERTY = actions.UPDATE_MARK_PROPERTY;
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
 * @returns {Object} The ADD_MARK action object
 */
function addMark(markProps) {
  var props = assign({
    _id: markProps._id || counter.global(),
    name: markProps.name || markName(markProps.type)
  }, markProps);
  var action = {
    id: props._id,
    name: props.name,
    type: ADD_MARK,
    props: props,
    streams: marks.getHandleStreams(props)
  };
  return action;
}

function updateMarkProperty(markId, property, value) {
  return {
    type: UPDATE_MARK_PROPERTY,
    id: markId,
    property: property,
    value: value
  };
}

/**
 * Action creator to set one existing mark as the child of another.
 * @param {number} childId - The child mark's ID
 * @param {number} parentId - The parent mark's ID
 * @returns {Object} The SET_PARENT_MARK action object
 */
function setParent(childId, parentId) {
  return {
    type: SET_PARENT_MARK,
    childId: childId,
    parentId: parentId
  };
}

module.exports = {
  addMark: addMark,
  updateMarkProperty: updateMarkProperty,
  setParent: setParent
};
