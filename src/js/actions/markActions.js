'use strict';

var assign   = require('object-assign'),
    counter  = require('../util/counter'),
    markName = require('../util/markName'),
    getIn = require('../util/immutable-utils').getIn,
    ADD_MARK = 'ADD_MARK',
    DELETE_MARK = 'DELETE_MARK',
    SET_PARENT_MARK = 'SET_PARENT_MARK',
    UPDATE_MARK_PROPERTY = 'UPDATE_MARK_PROPERTY';

/**
 * Action creator to create a new mark and add it to the store.
 *
 * @param {Object} markProps - The properties of the mark to create
 * @returns {Object} The ADD_MARK action object
 */
function addMark(markProps) {
  // We pull in all of the mark constructors purely to access their static
  // `.getHandleStreams` and `.defaultProperties` methods
  // TODO: Fix circular dependencies.
  var defs = require('../model/primitives/marks');

  var props = assign({
    _id: markProps._id || counter.global(),
    name: markProps.name || markName(markProps.type)
  }, markProps);

  return {
    id: props._id,
    name: props.name,
    type: ADD_MARK,
    props: props,
    streams: defs.getHandleStreams(props)
  };
}

/**
 * Action creator to delete a mark. It recursively calls itself on any children
 * of the specified mark.
 *
 * @returns {Function} An async action function
 */
function deleteMark(id) {
  return function(dispatch, getState) {
    var mark = getIn(getState(), 'marks.' + id).toJS();

    if (mark.marks && mark.marks.length) {
      mark.marks.forEach(function(childId) {
        dispatch(deleteMark(childId));
      });
    }

    dispatch({
      type: DELETE_MARK,
      // ID and Type are needed to clear up all the mark's signals, as those are
      // the values used to create a signal's identifying name.
      markId: mark._id,
      markType: mark.type
    });
  };
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
 *
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
  // Action Names
  ADD_MARK: ADD_MARK,
  DELETE_MARK: DELETE_MARK,
  SET_PARENT_MARK: SET_PARENT_MARK,
  UPDATE_MARK_PROPERTY: UPDATE_MARK_PROPERTY,

  // Action Creators
  addMark: addMark,
  deleteMark: deleteMark,
  setParent: setParent,
  updateMarkProperty: updateMarkProperty
};
