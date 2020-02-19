import {createStandardAction} from 'typesafe-actions';
import {InteractionRecord} from '../store/factory/Interaction';
import {LyraSelectionPreviewDef, LyraApplicationPreviewDef} from '../components/interactions/InteractionPreviewController';

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

export const setSelection = createStandardAction('SET_SELECTION').map((preview: LyraSelectionPreviewDef, id: number) => {
  const previewCopy = Object.assign({}, preview);
  delete previewCopy.ref;
  return {
    payload: previewCopy, meta: id
  }
});
export const setApplication = createStandardAction('SET_APPLICATION').map((preview: LyraApplicationPreviewDef, id: number) => {
  const previewCopy = Object.assign({}, preview);
  delete previewCopy.ref;
  return {
    payload: previewCopy, meta: id
  }
});
export const setValueInMark = createStandardAction('SET_VALUE_IN_MARK').map((payload: any, id: number) => {
  return {
    payload, meta: id
  }
});

export const setMarkPropertyValue = createStandardAction('SET_MARK_PROPERTY_VALUE').map((payload: any, id: number) => {
  return {
    payload, meta: id
  }
});
export const deleteInteraction = createStandardAction('DELETE_INTERACTION')<null, number>(); // id
