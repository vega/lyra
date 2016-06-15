'use strict';

var SET_ACTIVE_WALKTHROUGH = 'SET_ACTIVE_WALKTHROUGH',
  SET_ACTIVE_STEP = 'SET_ACTIVE_STEP',
  SET_WALKTHROUGH = 'SET_WALKTHROUGH',
  SET_WALKTHROUGH_ON = 'SET_WALKTHROUGH_ON';

/**
 * Walkthrough Actions
 * Used to instantiate a walkthrough & track state as a user goes through the tutorial
 */

function setActiveStep(id) {
  return {
    type: SET_ACTIVE_STEP,
    step: id
  };
}

function setActiveWalkthrough(key) {
  return {
    type: SET_ACTIVE_WALKTHROUGH,
    key: key
  };
}

function setWalkthrough(key, data) {
  return {
    type: SET_WALKTHROUGH,
    name: key,
    data: data
  };
}

module.exports = {
  // Action Names
  SET_ACTIVE_WALKTHROUGH: SET_ACTIVE_WALKTHROUGH,
  SET_ACTIVE_STEP: SET_ACTIVE_STEP,
  SET_WALKTHROUGH: SET_WALKTHROUGH,
  SET_WALKTHROUGH_ON: SET_WALKTHROUGH_ON,

  // Action Creators
  setWalkthrough: setWalkthrough,
  setActiveStep: setActiveStep,
  setActiveWalkthrough: setActiveWalkthrough
};
