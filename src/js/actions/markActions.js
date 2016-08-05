'use strict';

var dl = require('datalib'),
    counter  = require('../util/counter'),
    getInVis = require('../util/immutable-utils').getInVis,
    historyActions = require('./historyActions'),
    startBatch = historyActions.startBatch,
    endBatch = historyActions.endBatch,
    Mark = require('../store/factory/Mark'),
    ADD_MARK = 'ADD_MARK',
    DELETE_MARK = 'DELETE_MARK',
    SET_PARENT_MARK = 'SET_PARENT_MARK',
    UPDATE_MARK_PROPERTY = 'UPDATE_MARK_PROPERTY',
    SET_MARK_VISUAL = 'SET_MARK_VISUAL',
    DISABLE_MARK_VISUAL = 'DISABLE_MARK_VISUAL',
    RESET_MARK_VISUAL = 'RESET_MARK_VISUAL',
    BIND_SCALE = 'BIND_SCALE',
    BIND_FIELD = 'BIND_FIELD',
    SET_MARK_EXTENT = 'SET_MARK_EXTENT';

/**
 * Action creator to create a new mark and add it to the store.
 *
 * @param {Object} markProps - The properties of the mark to create
 * @returns {Object} The ADD_MARK action object
 */
function addMark(markProps) {
  // We pull in all of the mark constructors purely to access their static
  // `.getHandleStreams` and `.defaultProperties` methods
  var props = dl.extend({
    _id: markProps._id || counter.global(),
  }, markProps);

  return {
    id: props._id,
    name: props.name,
    type: ADD_MARK,
    props: props,
    streams: Mark.getHandleStreams(props)
  };
}

/**
 * Action creator to delete a mark. It recursively calls itself on any children
 * of the specified mark.
 *
 * @param {number} id The ID of the mark to delete.
 * @returns {Function} An async action function.
 */
function deleteMark(id) {
  return function(dispatch, getState) {
    var mark = getInVis(getState(), 'marks.' + id),
        children = mark.get('marks');

    dispatch(startBatch());

    if (children && children.size) {
      children.forEach(function(childId) {
        dispatch(deleteMark(childId));
      });
    }

    dispatch({
      type: DELETE_MARK,
      // ID and Type are needed to clear up all the mark's signals, as those are
      // the values used to create a signal's identifying name.
      id: mark.get('_id'),
      markType: mark.get('type')
    });

    dispatch(endBatch());
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

/**
 * Action creator to set the full definition of a mark's visual property.
 *
 * @param {number} id   The ID of the mark whose visual property is being set.
 * @param {string} property The visual property to set.
 * @param {Object} def A Vega definition for the visual property.
 * @returns {Object} The SET_MARK_VISUAL action object
 */
function setMarkVisual(id, property, def) {
  return {
    type: SET_MARK_VISUAL,
    id: id,
    property: property,
    def: def
  };
}

/**
 * Action creator to disable a mark's visual property.
 *
 * @param {number} id   The ID of the mark whose visual property is being disabled.
 * @param {string} property The visual property to disable.
 * @returns {Object} The DISABLE_MARK_VISUAL action object
 */
function disableMarkVisual(id, property) {
  return {
    type: DISABLE_MARK_VISUAL,
    id: id,
    property: property
  };
}

/**
 * Action creator to reset a mark's visual property back to being signal driven.
 *
 * @param {number} id The ID of the mark whose visual property is being disabled.
 * @param {string} property The visual property to disable.
 * @returns {Object} The DISABLE_MARK_VISUAL action object
 */
function resetMarkVisual(id, property) {
  return {
    type: RESET_MARK_VISUAL,
    id: id,
    property: property
  };
}

/**
 * Action creator to bind a mark's visual property to a scale.
 *
 * @param   {number} id       The ID of the mark to bind.
 * @param   {number} scaleId  The ID of the scale to bind.
 * @param   {string} property The name of the property to bind
 * @returns {Object} The BIND_SCALE action object.
 */
function bindScale(id, scaleId, property) {
  return {
    type: BIND_SCALE,
    id: id,
    scaleId: scaleId,
    property: property
  };
}

/**
 * Action creator to bind a mark's visual property to a fieldname.
 *
 * @param   {number} id       The ID of the mark to bind.
 * @param   {string} field    The name of the field to bind.
 * @param   {string} property The name of the property to bind
 * @returns {Object} The BIND_SCALE action object.
 */
function bindField(id, field, property) {
  return {
    type: BIND_SCALE,
    id: id,
    field: field,
    property: property
  };
}

/**
 * Action creator to set a rect mark's spatial extents.
 *
 * @param   {number} id         The ID of the mark to bind.
 * @param   {string} oldExtent  The old extent being disabled.
 * @param   {string} newExtent  The new extent being set.
 * @returns {Object} The SET_MARK_EXTENT action object.
 */
function setMarkExtent(id, oldExtent, newExtent) {
  return {
    type: SET_MARK_EXTENT,
    id: id,
    oldExtent: oldExtent,
    newExtent: newExtent
  };
}

module.exports = {
  // Action Names
  ADD_MARK: ADD_MARK,
  DELETE_MARK: DELETE_MARK,
  SET_PARENT_MARK: SET_PARENT_MARK,
  UPDATE_MARK_PROPERTY: UPDATE_MARK_PROPERTY,
  SET_MARK_VISUAL: SET_MARK_VISUAL,
  DISABLE_MARK_VISUAL: DISABLE_MARK_VISUAL,
  RESET_MARK_VISUAL: RESET_MARK_VISUAL,
  BIND_SCALE: BIND_SCALE,
  BIND_FIELD: BIND_FIELD,
  SET_MARK_EXTENT: SET_MARK_EXTENT,

  // Action Creators
  addMark: addMark,
  deleteMark: deleteMark,
  setParent: setParent,
  updateMarkProperty: updateMarkProperty,
  setMarkVisual: setMarkVisual,
  disableMarkVisual: disableMarkVisual,
  resetMarkVisual: resetMarkVisual,
  bindScale: bindScale,
  bindField: bindField,
  setMarkExtent: setMarkExtent
};
