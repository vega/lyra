import {createStandardAction} from 'typesafe-actions';
import {InteractionRecord, SelectionRecord, ApplicationRecord, InteractionInput, InteractionSignal} from '../store/factory/Interaction';
import {Dispatch} from 'redux';
import {addInteractionToGroup} from './bindChannel/helperActions';
import {assignId} from '../util/counter';
import {State} from '../store';
import {recordName} from '../util/recordName';
import {batchGroupBy} from '../reducers/historyOptions';

export function addInteraction (record: InteractionRecord) {
  return function(dispatch: Dispatch, getState: () => State) {
    const id: number = record.id || assignId(dispatch, getState());
    record = record.set('id', id);
    if (!record.get('name')) {
      record = record.set('name', recordName(getState(), 'interactions', 'Interaction'));
    }

    batchGroupBy.start();
    dispatch(baseAddInteraction(record, id));
    dispatch(addInteractionToGroup(id, record.groupId));
    batchGroupBy.end();
  };
}

export const baseAddInteraction = createStandardAction('ADD_INTERACTION')<InteractionRecord, number>();

export const setInput = createStandardAction('SET_INPUT')<InteractionInput, number>();
export const setSelection = createStandardAction('SET_SELECTION')<SelectionRecord, number>();

export const setSignals = createStandardAction('SET_INTERACTION_SIGNALS')<InteractionSignal[], number>();

export const setSignalPush = createStandardAction('SET_INTERACTION_SIGNAL_PUSH')<{[signalName: string]: boolean}, number>(); // signalName -> push, interactionId

export const toggleEnableApplicationType = createStandardAction('TOGGLE_ENABLE_APPLICATION_TYPE')<ApplicationRecord, number>();
export const setApplication = createStandardAction('SET_APPLICATION')<ApplicationRecord, number>();

export const removeApplication = createStandardAction('REMOVE_APPLICATION')<ApplicationRecord, number>();

export const deleteInteraction = createStandardAction('DELETE_INTERACTION')<{groupId: number}, number>(); // id

export const updateInteractionName = createStandardAction('UPDATE_INTERACTION_NAME')<string, number>();
