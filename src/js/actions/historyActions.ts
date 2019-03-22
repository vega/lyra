import {createStandardAction} from 'typesafe-actions';

export const undo = createStandardAction('UNDO')();
export const redo = createStandardAction('REDO')();
export const jumpToFuture = createStandardAction('JUMP_TO_FUTURE')<number>();
export const jumpToPast = createStandardAction('JUMP_TO_PAST')<number>();
export const clearHistory = createStandardAction('CLEAR_HISTORY')();
export const startBatch = createStandardAction('START_BATCH')();
export const endBatch = createStandardAction('END_BATCH')();
