'use strict';

var PARSE_VEGA = 'PARSE_VEGA',
    INVALIDATE_VEGA = 'INVALIDATE_VEGA';

/**
 * Action creator to set the state to represent an in-progress Lyra model parse.
 *
 * @param {boolean} value - Whether or not to mark a parse as being in-progress
 * @returns {Object} An action object
 */
function parseVega(value) {
  return {
    type: PARSE_VEGA,
    value: !!value
  };
}

/**
 * Action creator to set a flag which will be used to reparse (destroy and
 * re-create) the vega view representing the Lyra model.
 *
 * @param {boolean} shouldReparse - Whether the view should be recreated on the
 * next store update cycle.
 * @returns {Object} An action object
 */
function invalidateVega(shouldReparse) {
  return {
    type: INVALIDATE_VEGA,
    value: !!shouldReparse
  };
}

module.exports = {
  // Action Names
  PARSE_VEGA: PARSE_VEGA,
  INVALIDATE_VEGA: INVALIDATE_VEGA,

  // Action Creators
  parseVega: parseVega,
  invalidateVega: invalidateVega
};
