import {ActionType, getType} from 'typesafe-actions';
import * as helperActions from '../actions/bindChannel/helperActions';
import * as datasetActions from '../actions/datasetActions';
import * as guideActions from '../actions/guideActions';
import * as markActions from '../actions/markActions';
import * as pipelineActions from '../actions/pipelineActions';
import * as scaleActions from '../actions/scaleActions';
import * as sceneActions from '../actions/sceneActions';
import * as signalActions from '../actions/signalActions';
import * as vegaActions from '../actions/vegaActions';
import {VegaReparse, VegaReparseRecord} from '../store/factory/Vega';

/**
 * This reducer handles whether to recreate the view from the lyra ctrl.
 * @param {boolean} state - The existing ctrl reparse value from the store
 * @param {Object} action - The dispatched action indicating how to modify
 * the reparse flag within the store.
 * @returns {boolean} The new state of the reparse flag
 */
export function invalidateVegaReducer(state: VegaReparseRecord,
                              action: ActionType<typeof vegaActions | typeof datasetActions |
                              typeof markActions | typeof pipelineActions | typeof sceneActions |
                              typeof scaleActions | typeof helperActions | typeof signalActions | typeof guideActions>): VegaReparseRecord {
  if (typeof state === 'undefined') {
    return VegaReparse({
      invalid: false,
      isParsing: false,
    });
  }

  if (action.type === getType(vegaActions.invalidateVega)) {
    return state.set('invalid', action.payload);
  }

  //  TODO the rest of the actions
  // All of these actions implicitly invalidate the view
  const invalidatingActions = [
    getType(sceneActions.createScene),
    getType(pipelineActions.baseAddPipeline),
    getType(signalActions.initSignal),
    getType(markActions.addMark),
    getType(guideActions.deleteGuide),
    getType(markActions.baseDeleteMark),
    getType(markActions.setParent),
    getType(markActions.updateMarkProperty),
    getType(markActions.setMarkVisual),
    getType(markActions.disableMarkVisual),
    getType(markActions.resetMarkVisual),
    getType(markActions.setMarkExtent),
    getType(markActions.bindScale),
    getType(scaleActions.addScale),
    getType(scaleActions.updateScaleProperty),
    getType(helperActions.addScaleToGroup),
    getType(scaleActions.deleteScale),
    getType(guideActions.addGuide),
    getType(guideActions.updateGuideProperty),
    getType(helperActions.addAxisToGroup),
    getType(helperActions.addLegendToGroup),
    // ACTIONS.REMOVE_AXIS_FROM_GROUP, // TODO this action doesn't exist (but would belong in helperActions)
    getType(datasetActions.sortDataset),
    getType(datasetActions.addTransform),
    getType(datasetActions.updateTransform),
    ACTIONS.UNDO, ACTIONS.REDO,
    ACTIONS.JUMP_TO_FUTURE, ACTIONS.JUMP_TO_PAST
  ];
  if (invalidatingActions.indexOf(action.type) >= 0) {
    return state.set('invalid', true);
  }

  if (action.type === getType(vegaActions.parseVega)) {
    return state.merge({
      isParsing: action.payload,
      // Toggle this back to false now that the parse is in progress (or done)
      invalid: false
    });
  }

  return state;
}
