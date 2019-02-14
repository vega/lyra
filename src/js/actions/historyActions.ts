'use strict';
var UNDO = 'UNDO',
    REDO = 'REDO',
    JUMP_TO_FUTURE = 'JUMP_TO_FUTURE',
    JUMP_TO_PAST = 'JUMP_TO_PAST',
    CLEAR_HISTORY = 'CLEAR_HISTORY',
    START_BATCH = 'START_BATCH',
    END_BATCH = 'END_BATCH';

function undo() {
  return {type: UNDO};
}

function redo() {
  return {type: REDO};
}

function jumpToFuture(index) {
  return {type: JUMP_TO_FUTURE, index: index};
}

function jumpToPast(index) {
  return {type: JUMP_TO_PAST, index: index};
}

function clearHistory() {
  return {type: CLEAR_HISTORY};
}

function startBatch() {
  return {type: START_BATCH};
}

function endBatch() {
  return {type: END_BATCH};
}

module.exports = {
  // Action Names
  UNDO: UNDO,
  REDO: REDO,
  JUMP_TO_FUTURE: JUMP_TO_FUTURE,
  JUMP_TO_PAST: JUMP_TO_PAST,
  CLEAR_HISTORY: CLEAR_HISTORY,
  START_BATCH:  START_BATCH,
  END_BATCH: END_BATCH,

  // Action Creators
  undo: undo,
  redo: redo,
  jumpToFuture: jumpToFuture,
  jumpToPast: jumpToPast,
  clearHistory: clearHistory,
  startBatch: startBatch,
  endBatch: endBatch
};
