'use strict';
var PARSE_VEGA = require('../constants/actions').PARSE_VEGA;

/**
 * Action creator to set the state to represent an in-progress Lyra model parse.
 *
 * @param {boolean} value - Whether or not to mark a parse as being in-progress
 * @returns {Object} An action object
 */
module.exports = function(value) {
  return {
    type: PARSE_VEGA,
    value: !!value
  };
};
