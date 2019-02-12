'use strict';

import {createStandardAction} from 'typesafe-actions';
import {ScaleRecord} from '../store/factory/Scale';
import * as counter from '../util/counter';

// /**
//  * Action creator to create a new scale and add it to the store.
//  */
export const addScale = createStandardAction('ADD_SCALE').map((payload: ScaleRecord) => {
  const id = payload._id || counter.global();
  return {payload: payload.merge({_id: id}), meta: id}
});

export const updateScaleProperty = createStandardAction('UPDATE_SCALE_PROPERTY')<{scaleId: number, property: any, value: any}, number>();

export const amendDataRef = createStandardAction('AMEND_DATA_REF')<{scaleId: number, property: any, ref: any}, number>();

export const deleteScale = createStandardAction('DELETE_SCALE')<{id: number}, number>();
