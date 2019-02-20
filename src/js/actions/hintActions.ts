import {createStandardAction} from 'typesafe-actions';

export const hintsOn = createStandardAction('HINTS_ON')<boolean>();
export const clearHints = createStandardAction('CLEAR_HINTS')();

// unused
// export const displayHints = createStandardAction('DISPLAY_HINTS')();
