import {createStandardAction} from 'typesafe-actions';
import {GuideRecord} from '../store/factory/Guide';

const counter = require('../util/counter');

export const addGuide = createStandardAction('ADD_GUIDE')
  .map((payload: GuideRecord) => {
        const id: number = payload._id || counter.global();
        // TODO(rneogy) figure out better solution for payload as any
        return {payload: (payload as any).merge({_id: id}) as GuideRecord, meta: id}
    }
  );

export const deleteGuide = createStandardAction('DELETE_GUIDE')<{groupId: number}, number>();

export const updateGuideProperty = createStandardAction('UPDATE_GUIDE_PROPERTY')<{property: string, value: any}, number>();
