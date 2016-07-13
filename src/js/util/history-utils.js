'use strict';
var paused = false;

module.exports = {
  config: {
    limit: 20,
    filter: function() {
      return paused === false;
    }
  },
  pause: function() {
    paused = true;
  },
  resume: function() {
    paused = false;
  }
};
