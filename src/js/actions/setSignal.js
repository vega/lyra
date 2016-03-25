'use strict';
var SET_SIGNAL = require('../constants/actions').SET_SIGNAL;

module.exports = function(signal, value) {
  return {
    type: SET_SIGNAL,
    signal: signal,
    value: value
  };
};
