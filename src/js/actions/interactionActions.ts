import {createStandardAction} from 'typesafe-actions';
import {LyraSelectionType, InteractionRecord, LyraMappingType} from '../store/factory/Interaction';

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

export const setSelectionType = createStandardAction('SET_INTERACTION_TYPE')<LyraSelectionType, number>(); // selectionType, id
export const setMappingType = createStandardAction('SET_MAPPING_TYPE')<LyraMappingType, number>(); // mappingType, id
export const deleteInteraction = createStandardAction('DELETE_INTERACTION')<null, number>(); // id
