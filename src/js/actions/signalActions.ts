import {createStandardAction} from 'typesafe-actions';
import {OnEvent} from 'vega-typings/types';

const ns = require('../util/ns');

    INIT_SIGNAL = 'INIT_SIGNAL',
    SET_SIGNAL  = 'SET_SIGNAL',
    SET_SIGNAL_STREAMS = 'SET_SIGNAL_STREAMS',
    UNSET_SIGNAL = 'UNSET_SIGNAL';

/**
 * Action creator to initialize a signal.
 *
 * @param {string} signal - Name of a signal to initialize
 * @param {*} value - The initial value of the signal
 * @returns {Object} An action object
 */
export const initSignal = createStandardAction('INIT_SIGNAL')<any, string>();

/**
 * Action creator to configure the initial value of a signal.
 *
 * @param {string} signal - Name of the signal to modify
 * @param {*} value - The value to set as the signal's initial value
 * @returns {Object} An action object
 */
export const setSignal = createStandardAction('SET_SIGNAL')<any, string>();

/**
 * Action creator to configure a property to update based on a stream.
 *
 * @param {string} signal - Name of a signal to connect to a stream
 * @param {Object[]} streams - Array of stream configuration objects
 * @returns {Object} An action object
 */
export const setSignalStreams = createStandardAction('SET_SIGNAL_STREAMS')<OnEvent[], string>();

/**
 * Unset a signal in the current store
 *
 * @param {string} signal - Name of the signal to modify
 * @returns {Object} An action object
 */
export const unsetSignal = createStandardAction('UNSET_SIGNAL')<null, string>();
