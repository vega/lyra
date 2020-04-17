import {createStandardAction} from 'typesafe-actions';
import {WidgetRecord, WidgetSelectionRecord} from '../store/factory/Widget';
import {MarkApplicationRecord} from '../store/factory/Interaction';
import {Dispatch} from 'redux';
import {addWidgetToGroup} from './bindChannel/helperActions';
import {State} from '../store';

const counter = require('../util/counter');

export function addWidget (record: WidgetRecord) {
  return function(dispatch: Dispatch, getState: () => State) {
    const id: number = record.id || counter.global();
    record = (record as any).merge({id: id}) as WidgetRecord;
    if (!record.get('name')) {
      record = record.set('name', "Widget "+id);
    }

    dispatch(baseAddWidget(record, id));
    dispatch(addWidgetToGroup(id, record.groupId));
  };
}
export const baseAddWidget = createStandardAction('ADD_WIDGET')<WidgetRecord, number>();

export const setSelection = createStandardAction('SET_WIDGET_SELECTION')<WidgetSelectionRecord, number>();

export const setApplication = createStandardAction('SET_WIDGET_APPLICATION')<MarkApplicationRecord, number>();

export const removeApplication = createStandardAction('REMOVE_WIDGET_APPLICATION')<MarkApplicationRecord, number>();

export const deleteWidget = createStandardAction('DELETE_WIDGET')<{groupId: number}, number>(); // id

export const updateWidgetName = createStandardAction('UPDATE_WIDGET_NAME')<string, number>();
