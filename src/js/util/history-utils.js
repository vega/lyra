'use strict';
var hu = module.exports = {},
    ACTIONS = require('../actions/Names'),
    paused = false;

hu.pause = function() {
  paused = true;
};

hu.resume = function() {
  paused = false;
};

hu.config = {
  limit: 20,
  debug: true,
  filter: function(action) {
    return paused === false &&
      [ACTIONS.ADD_PIPELINE, ACTIONS.ADD_DATASET, ACTIONS.INIT_DATASET]
        .indexOf(action.type) < 0;
  }
};
