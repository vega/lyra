import {createStandardAction} from 'typesafe-actions';
import {InteractionRecord, SelectionRecord, ApplicationRecord, InteractionInput} from '../store/factory/Interaction';
import {string} from 'prop-types';

const counter  = require('../util/counter');

export const addInteraction = createStandardAction('ADD_INTERACTION').map((record: InteractionRecord) => {
  const id: number = record.id || counter.global();
  record = (record as any).merge({id: id}) as InteractionRecord;
  if (!record.get('name') || record.get('name') === 'New Interaction') {
    record = record.set('name', "Interaction "+id);
  }

  return {
    payload: record, meta: id
  }
});

export const setInput = createStandardAction('SET_INPUT')<InteractionInput, number>();
export const setSelection = createStandardAction('SET_SELECTION')<SelectionRecord, number>();

export const setApplication = createStandardAction('SET_APPLICATION')<ApplicationRecord, number>();

export const deleteInteraction = createStandardAction('DELETE_INTERACTION')<{groupId: number}, number>(); // id

export const updateInteractionName = createStandardAction('UPDATE_INTERACTION_NAME')<string, number>();
