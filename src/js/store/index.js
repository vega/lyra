'use strict';

var configureStore = require('./configureStore');

/**
 * This module exports the configured store as a singleton that can be required
 * from anywhere in Lyra
 * @type {Store}
 */
module.exports = window.store = configureStore(require('./defaultState'));
