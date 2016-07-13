'use strict';

var dl = require('datalib'),
    counter = require('../util/counter'),
    ADD_GUIDE = 'ADD_GUIDE',
    DELETE_GUIDE = 'DELETE_GUIDE',
    UPDATE_GUIDE_PROPERTY = 'UPDATE_GUIDE_PROPERTY';

/**
 * Action creator to create a new guide and add it to the store.
 *
 * @param {Object} guideProps - The properties of the guide to create
 * @returns {Object} The ADD_GUIDE action object
 */
function addGuide(guideProps) {
  var props = dl.extend({
    _id: guideProps._id || counter.global(),
  }, guideProps);

  return {
    id: props._id,
    type: ADD_GUIDE,
    props: props
  };
}

/**
 * Action creator to delete a guide and remove it from its
 * group.
 *
 * @param {number} guideId - The ID of the guide to delete
 * @param {number} groupId - The ID of the group this guide belongs to
 * @returns {Object} The ADD_GUIDE action object
 */
function deleteGuide(guideId, groupId) {
  return {
    type: DELETE_GUIDE,
    id: guideId,
    groupId: groupId
  };
}

function updateGuideProperty(guideId, property, value) {
  return {
    type: UPDATE_GUIDE_PROPERTY,
    id: guideId,
    property: property,
    value: value
  };
}

module.exports = {
  // Action Names
  ADD_GUIDE: ADD_GUIDE,
  DELETE_GUIDE: DELETE_GUIDE,
  UPDATE_GUIDE_PROPERTY: UPDATE_GUIDE_PROPERTY,

  // Action Creators
  addGuide: addGuide,
  deleteGuide: deleteGuide,
  updateGuideProperty: updateGuideProperty
};
