import {createStandardAction} from 'typesafe-actions';
import {InteractionRecord, SelectionRecord, ApplicationRecord} from '../store/factory/Interaction';

const counter  = require('../util/counter');

export const addInteraction = createStandardAction('ADD_INTERACTION').map((record: InteractionRecord) => {
  const id: number = record.id || counter.global();
  record = (record as any).merge({id: id}) as InteractionRecord;
  if (!record.get('name')) {
    record = record.set('name', "Interaction "+id);
  }

  return {
    payload: record, meta: id
  }
});

export const setSelection = createStandardAction('SET_SELECTION').map((payload: SelectionRecord, id: number) => {
  return {
    payload, meta: id
  }
});
export const setApplication = createStandardAction('SET_APPLICATION').map((payload: ApplicationRecord, id: number) => {
  return {
    payload, meta: id
  }
});
export const deleteInteraction = createStandardAction('DELETE_INTERACTION')<{groupId: number}, number>(); // id
