'use strict';
var types = require('../constants/actions');

/**
 * Walkthrough Actions
 * Used to instantiate a walkthrough & track state as a user goes through the tutorial
 */

function setActiveStep(id) {
  return {
    type: types.SET_ACTIVE_STEP,
    step: id
  };
}

function setActiveWalkthrough(key) {
  return {
    type: types.SET_ACTIVE_WALKTHROUGH,
    key: key
  };
}

function setWalkthrough(key, data) {
  return {
    type: types.SET_WALKTHROUGH,
    name: key,
    data: data
  };
}

module.exports = {
  setWalkthrough: setWalkthrough,
  setActiveStep: setActiveStep,
  setActiveWalkthrough: setActiveWalkthrough
};
