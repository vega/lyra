'use strict';

const dl = require('datalib');
const counter = require('../util/counter');
const ADD_SCALE = 'ADD_SCALE';
const UPDATE_SCALE_PROPERTY = 'UPDATE_SCALE_PROPERTY';
const AMEND_DATA_REF = 'AMEND_DATA_REF';
const DELETE_SCALE = 'DELETE_SCALE';

import {RecordOf} from 'immutable';
import {Dispatch} from 'redux';
import {createStandardAction} from 'typesafe-actions';
import {LyraScale} from '../store/factory/Scale';

/**
 * Action creator to create a new scale and add it to the store.
 *
 * @param {Object} scaleProps - The properties of the scale to create
 * @returns {Object} The ADD_SCALE action object
 */
export function addScale(scaleProps) {
  const props = dl.extend({
    _id: scaleProps._id || counter.global(),
  }, scaleProps);

  return {
    id: props._id,
    type: ADD_SCALE,
    props: props
  };
}

export function updateScaleProperty(scaleId, property, value) {
  return {
    type: UPDATE_SCALE_PROPERTY,
    id: scaleId,
    property: property,
    value: value
  };
}

export function amendDataRef(scaleId, property, ref) {
  return {
    type: AMEND_DATA_REF,
    id: scaleId,
    property: property,
    ref: ref
  };
}

export function deleteScale(id) {
  return {
    type: DELETE_SCALE,
    id: id
  };
}

module.exports = {
  // Action Names
  ADD_SCALE: ADD_SCALE,
  UPDATE_SCALE_PROPERTY: UPDATE_SCALE_PROPERTY,
  AMEND_DATA_REF: AMEND_DATA_REF,
  DELETE_SCALE: DELETE_SCALE,

  // Action Creators
  addScale: addScale,
  updateScaleProperty: updateScaleProperty,
  amendDataRef: amendDataRef,
  deleteScale: deleteScale
};
