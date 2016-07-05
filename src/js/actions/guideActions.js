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

function deleteGuide(guideId) {
  return {
    type: DELETE_GUIDE,
    id: guideId
  };
}

function updateGuideProperty(GuideId, property, value) {
  return {
    type: UPDATE_GUIDE_PROPERTY,
    id: GuideId,
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
