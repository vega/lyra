import {Dispatch} from 'redux';
import {createStandardAction} from 'typesafe-actions';
import {OnEvent, SignalValue} from 'vega-typings/types';
import {State} from '../store';
import {invalidateVega} from './vegaActions';
import {debounce} from 'vega';
import {string} from 'yargs';

/**
 * Action creator to initialize a signal.
 *
 * @param {string} signal - Name of a signal to initialize
 * @param {*} value - The initial value of the signal
 * @returns {Object} An action object
 */
export const initSignal = createStandardAction('INIT_SIGNAL')<SignalValue, string>();

/**
 * Action creator to configure the initial value of a signal.
 *
 * @param {string} signal - Name of the signal to modify
 * @param {*} value - The value to set as the signal's initial value
 * @returns {Object} An action object
 */
export const baseSetSignal = createStandardAction('SET_SIGNAL')<SignalValue, string>();

const dispatchInvalidateVega = debounce(500, (dispatch: Dispatch) => {
  dispatch(invalidateVega(true));
});

export function setSignal (value: SignalValue, signal: string) {
  return function(dispatch: Dispatch, getState: () => State) {
    if (signal.startsWith('lyra_group') && (signal.endsWith('width') || signal.endsWith('height') || signal.endsWith('x') || signal.endsWith('y'))) {
      // re-render vega when resizing a view to get the canvas to resize
      const store = getState();
      const isParsing = store.getIn(['vega', 'isParsing']);
      if (!isParsing) {
        dispatchInvalidateVega(dispatch);
      }
    }
    dispatch(baseSetSignal(value, signal));
  };
}



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

export const addSignalUpdate = createStandardAction('ADD_SIGNAL_UPDATE')<string, string>(); // update expression string, signal name