import {createStandardAction} from 'typesafe-actions';
import {LyraInteractionType, InteractionRecord, LyraMappingType} from '../store/factory/Interaction';

const counter  = require('../util/counter');

export const addInteraction = createStandardAction('ADD_INTERACTION').map((record: InteractionRecord) => {
  const id: number = record.id || counter.global();
  record = (record as any).merge({id: id}) as InteractionRecord;

  return {
    payload: record, meta: id
  }
});

export const setInteractionType = createStandardAction('SET_INTERACTION_TYPE')<LyraInteractionType, number>(); // interactionType, id
export const setMappingType = createStandardAction('SET_MAPPING_TYPE')<LyraMappingType, number>(); // mappingType, id
export const deleteInteraction = createStandardAction('DELETE_INTERACTION')<null, number>(); // id
