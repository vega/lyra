'use strict';
var INIT_SIGNAL = require('../constants/actions').INIT_SIGNAL;
var ns = require('../util/ns');

module.exports = function(signal, value) {
  return {
    type: INIT_SIGNAL,
    signal: ns(signal),
    value: value
  };
};
