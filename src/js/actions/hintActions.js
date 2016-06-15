'use strict';

var HINTS_ON = 'HINTS_ON',
  DISPLAY_HINTS = 'DISPLAY_HINTS',
  CLEAR_HINTS = 'CLEAR_HINTS';

function hintsOn(boolean) {
  return {
    type: HINTS_ON,
    on: boolean
  };
}

function clearHints() {
  return {
    type: CLEAR_HINTS
  };
}

module.exports = {
  // Action Names
  HINTS_ON: HINTS_ON,
  DISPLAY_HINTS: DISPLAY_HINTS,
  CLEAR_HINTS: CLEAR_HINTS,

  // Action Creators
  on: hintsOn,
  clearHints: clearHints
};
