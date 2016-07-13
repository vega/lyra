'use strict';
var store = require('../store'),
    getInVis = require('./immutable-utils').getInVis,
    ns = require('./ns');

/**
 * Retrieves the value stored in redux for the signal
 *
 * @param {string} signal - The name of the signal
 * @returns {string|number|object} returns what is stored in redux which could be one of these types
 */
module.exports = function(signal) {
  return getInVis(store.getState(), 'signals.' + ns(signal) + '.init');
};
