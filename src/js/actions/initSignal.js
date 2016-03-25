'use strict';
var INIT_SIGNAL = require('../constants/actions').INIT_SIGNAL;

module.exports = function(signal, value) {
  return {
    type: INIT_SIGNAL,
    signal: signal,
    value: value
  };
};
