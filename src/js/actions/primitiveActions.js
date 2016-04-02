'use strict';
var actions = require('../constants/actions');
var PRIMITIVE_ADD_MARK = actions.PRIMITIVE_ADD_MARK;
var PRIMITIVE_SET_PARENT = actions.PRIMITIVE_SET_PARENT;
var ns = require('../util/ns');
var counter = require('../util/counter');
var markName = require('../util/markName');

/**
 * Action creator to create a new mark and add it to the store. (This creator is
 * intended for use with marks, and not other primitives like scales or axes.)
 * @param {Object} primitiveProps - The properties of the primitive to create
 * @returns {Object} The PRIMITIVE_ADD_MARK action object
 */
function addMark(primitiveProps) {
  var action = {
    id: primitiveProps.id || counter.global(),
    name: primitiveProps.name || markName(primitiveProps.type),
    type: PRIMITIVE_ADD_MARK,
    props: primitiveProps
  };
  return action;
};

/**
 * Action creator to mark one existing primitive as the child of another.
 * @param {number} childId - The child primitive's ID
 * @param {number} parentId - The parent primitive's ID
 * @returns {Object} The PRIMITIVE_SET_PARENT action object
 */
function setParent(childId, parentId) {
  return {
    type: PRIMITIVE_SET_PARENT,
    childId: childId,
    parentId: parentId
  };
}

module.exports = {
  addMark: addMark,
  setParent: setParent
};
