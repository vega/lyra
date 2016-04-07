/**
 * Walkthrough Utilities for selecting, quitting and loading specs
 * These exist as json files in the /walkthrough folder
 */


/**
 * Load the spec from the current step into redux
 * @param  {Object} spec - a lyra object to load into redux
 */
function loadSpec(spec) {
  // get spec from walkthrough

  // set in redux

  // return something
  return;
}

/**
 * Set SET_WALKTHROUGH_ON to false
 */
function quitWalkthough() {

}

/**
 * Set SET_ACTIVE_WALKTHROUGH to a specific walkthrough
 */
function selectWalkthough() {

}

/**
 * Validate the current lyra spec against the spec for the next step in the
 * walkthrough. If they match continue to the next step.
 *
 * @returns {Object} returns an object containing success_status and message.
 */
function validateStep() {
  var success = false,
      message = "Error: Something has gone wrong. Hit reset and try again. :)";

  // get current lyra object

  // if there is none return success

  // if match set success to true, message to "success"

  // else return default error

  return {
    success_status: success,
    message: message
  }
}


module.exports = {
  select: selectWalkthough,
  quit: quitWalkthrough,
  loadSpec: loadSpec,
  validate: validateStep
};

