/**
 * Walkthrough Class
 * Used to instantiate a walkthrough & track state as a user goes through the tutorial
 */
'use strict';
var _ = require('lodash');

function Walkthrough(data, step){
  this.title = data.title;
  this.data = data.steps;
  this.currentStep = step || 1;
  return this;
}

/**
 * Validate the current lyra spec against the spec for the next step in the
 * walkthrough. If they match continue to the next step.
 *
 * @returns {Object} returns an object containing success_status and message.
 */
Walkthrough.prototype.validateStep = function() {
  var success = false,
      message = "Error: Something has gone wrong. Hit reset and try again. :)";

  // get current lyra object
  var currentSpec = {},
      validationSpec = this.next().spec;

  // if there is none return success

  // if match set success to true, message to "success"

  // else return default error

  return {
    success_status: success,
    message: message
  }
}

/**
 * Get walkthrough step
 * @param  {number} id - the ID of the step in the walkthrough
 * @return {Object} returns the object that matches that id
 */
Walkthrough.prototype.get = function(id) {
  // get walkthrough[n].id === id
  console.log(_.find(this.data, function(o) { return o.id === id; }));
  return _.find(this.data, function(o) { return o.id === id; });
}

/**
 * Get current step
 * @return {Object} returns the object whose ID matches the current step
 */
Walkthrough.prototype.getCurrent = function(){
  return this.get(this.currentStep);
}

/**
 * Get next step in the walkthrough
 * @return {Object} - returns the next step in the walkthrough
 */
Walkthrough.prototype.next = function() {
  var nextStep = this.currentStep++;
  this.currentStep = nextStep;
  return this.get(nextStep);
};

/**
 * Get previous step in the walkthrough
 * @return {Object} - returns the previous step in the walkthrough
 */
Walkthrough.prototype.prev = function() {
  var previousStep = this.currentStep--;
  this.currentStep = previousStep;
  return this.get(previousStep);
}

module.exports = Walkthrough;
