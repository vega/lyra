'use strict';
var constants = require('../constants/actions');

function hintsOn(boolean) {
  return {
    type: constants.HINTS_ON,
    on: boolean
  };
}

function clearHints() {
  return {
    type: constants.CLEAR_HINTS
  };
}

module.exports = {
  on: hintsOn,
  clearHints: clearHints
};
