'use strict';
var types = require('../constants/actions');
/**
 * Walkthrough Actions
 * Used to instantiate a walkthrough & track state as a user goes through the tutorial
 */

module.exports.setActiveStep = function setActiveStep(id) {
  return {
    type: types.SET_ACTIVE_STEP,
    step: id
  };
}

module.exports.setActiveWalkthrough = function setActiveWalkthrough(key) {
  return {
    type: types.SET_ACTIVE_WALKTHROUGH,
    key: key
  };
}

module.exports.setWalkthrough = function setWalkthrough(key, data) {
  return {
    type: types.SET_WALKTHROUGH,
    name: key,
    data: data
  };
}

module.exports.setWalkthroughOn = function setWalkthroughOn(boolean) {
  return {
    type: types.SET_WALKTHROUGH_ON,
    on: boolean
  };
}

module.exports.loadWalkthrough = function loadWalkthrough (key,url) {
  return function (dispatch) {
    return fetch(url)
      .then(response => response.json())
      .then(json =>
        dispatch(setWalkthrough(key, json))
      );
  }
}
