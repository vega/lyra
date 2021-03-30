const getInVis = require('../util/immutable-utils').getInVis;

import {createStandardAction} from 'typesafe-actions';
import {HistoryRecord} from '../store/factory/History';


/**
 * TODO: Action creator to derive a history based on an existing dataset source.
 * A derived history shares an existing source dataset.
 *
 * @param {Object} historyId - The id of the history to derive.
 */
export function mergeHistory (historyId: number) {

  return null;
}


// action creators prefixed with "base" should only be called by their redux-thunk function wrappers - jzong
export const baseAddHistory = createStandardAction('ADD_HISTORY')<HistoryRecord, number>();
export const updateHistoryProperty = createStandardAction('UPDATE_HISTORY_PROPERTY')<{property: string, value: any}, number>();
