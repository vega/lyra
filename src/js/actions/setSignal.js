'use strict';
var SET_SIGNAL = require('../constants/actions').SET_SIGNAL;
var ns = require('../util/ns');

module.exports = function(signal, value) {
  return {
    type: SET_SIGNAL,
    signal: ns(signal),
    value: value
  };
};
