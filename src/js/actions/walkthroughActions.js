'use strict';

var SET_ACTIVE_WALKTHROUGH = 'SET_ACTIVE_WALKTHROUGH',
    SET_ACTIVE_STEP = 'SET_ACTIVE_STEP',
    SET_WALKTHROUGH = 'SET_WALKTHROUGH',
    SET_WALKTHROUGH_ON = 'SET_WALKTHROUGH_ON',
    PAUSE_WALKTHROUGH = 'PAUSE_WALKTHROUGH';

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

function pauseWalkthrough(key, activeStep) {
  return function(state, dispatch) {
    var paused = {
      key: key || null,
      activeStep: activeStep || null
    };

    dispatch({
      type: PAUSE_WALKTHROUGH,
      paused: paused
    });
  };
}

module.exports = {
  // Action Names
  SET_ACTIVE_WALKTHROUGH: SET_ACTIVE_WALKTHROUGH,
  SET_ACTIVE_STEP: SET_ACTIVE_STEP,
  SET_WALKTHROUGH: SET_WALKTHROUGH,
  SET_WALKTHROUGH_ON: SET_WALKTHROUGH_ON,
  PAUSE_WALKTHROUGH: PAUSE_WALKTHROUGH,

  // Action Creators
  setWalkthrough: setWalkthrough,
  setActiveStep: setActiveStep,
  setActiveWalkthrough: setActiveWalkthrough,
  pauseWalkthrough: pauseWalkthrough
};
