import {createStandardAction} from 'typesafe-actions';

export const undo = createStandardAction('UNDO')();
export const redo = createStandardAction('REDO')();
export const jumpToFuture = createStandardAction('JUMP_TO_FUTURE')<number>();
export const jumpToPast = createStandardAction('JUMP_TO_PAST')<number>();
export const clearHistory = createStandardAction('CLEAR_HISTORY')();
export const startBatch = createStandardAction('START_BATCH')();
export const endBatch = createStandardAction('END_BATCH')();

module.exports = {
  // Action Names
  UNDO: 'UNDO',
  REDO: 'REDO',
  JUMP_TO_FUTURE: 'JUMP_TO_FUTURE',
  JUMP_TO_PAST: 'JUMP_TO_PAST',
  CLEAR_HISTORY: 'CLEAR_HISTORY',
  START_BATCH:  'START_BATCH',
  END_BATCH: 'END_BATCH',

  // Action Creators
  undo: undo,
  redo: redo,
  jumpToFuture: jumpToFuture,
  jumpToPast: jumpToPast,
  clearHistory: clearHistory,
  startBatch: startBatch,
  endBatch: endBatch
};
