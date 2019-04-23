'use strict';

import {store} from '../store/index';

const getInVis = require('./immutable-utils').getInVis,
  ns = require('./ns');

/**
 * Retrieves the value stored in redux for the signal
 *
 * @param {string} signal - The name of the signal
 * @returns {string|number|object} returns what is stored in redux which could be one of these types
 */
export function signalLookup(signal: string) {
  return store.getState().getIn(['vis', 'present', 'signals', ns(signal), 'value']);
}
