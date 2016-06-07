'use strict';
var UPDATE_SCALE_PROPERTY = require('../constants/actions').UPDATE_SCALE_PROPERTY;

function updateScaleProperty(scaleId, property, value) {
  return {
    type: UPDATE_SCALE_PROPERTY,
    id: scaleId,
    property: property,
    value: value
  };
}

module.exports = updateScaleProperty;
