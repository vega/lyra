import {createStandardAction} from 'typesafe-actions';
import {InteractionRecord} from '../store/factory/Interaction';
import {LyraSelectionPreviewDef, LyraMappingPreviewDef} from '../components/interactions/InteractionPreviewController';
import {Signal} from 'vega';

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
export const setMapping = createStandardAction('SET_MAPPING').map((preview: LyraMappingPreviewDef, id: number) => {
  const previewCopy = Object.assign({}, preview);
  delete previewCopy.ref;
  return {
    payload: previewCopy, meta: id
  }
});
export const addWidgetSignals = createStandardAction('SET_WIDGET_DATA_FIELD')<Signal[], number>(); // mappingField, id

export const deleteInteraction = createStandardAction('DELETE_INTERACTION')<null, number>(); // id
