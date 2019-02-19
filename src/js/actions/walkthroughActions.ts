import {createStandardAction} from 'typesafe-actions';
import {WalkthroughName} from '../store/factory/Walkthrough';
import {WalkthroughJSON} from '../walkthrough';

/**
 * Walkthrough Actions
 * Used to instantiate a walkthrough & track state as a user goes through the tutorial
 */

export const setActiveStep = createStandardAction('SET_ACTIVE_STEP')<number>();
export const setActiveWalkthrough = createStandardAction('SET_ACTIVE_WALKTHROUGH')<WalkthroughName>();

// TODO(jzong): unused, need to clarify what the intent was
// export const setWalkthrough = createStandardAction('SET_WALKTHROUGH')<any, any>();
