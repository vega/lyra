import {createStandardAction} from 'typesafe-actions';
import {WidgetRecord, WidgetSelectionRecord} from '../store/factory/Widget';
import {MarkApplicationRecord, InteractionSignal} from '../store/factory/Interaction';
import {Dispatch} from 'redux';
import {addWidgetToGroup} from './bindChannel/helperActions';
import {State} from '../store';
import {assignId} from '../util/counter';
import {recordName} from '../util/recordName';

export function addWidget (record: WidgetRecord) {
  return function(dispatch: Dispatch, getState: () => State) {
    const id: number = record.id || assignId(dispatch, getState());
    record = (record as any).merge({id: id}) as WidgetRecord;
    if (!record.get('name')) {
      record = record.set('name', recordName(getState(), 'widgets', 'Widget'));
    }

    dispatch(baseAddWidget(record, id));
    dispatch(addWidgetToGroup(id, record.groupId));
  };
}
export const baseAddWidget = createStandardAction('ADD_WIDGET')<WidgetRecord, number>();

export const setSelection = createStandardAction('SET_WIDGET_SELECTION')<WidgetSelectionRecord, number>();

export const setApplication = createStandardAction('SET_WIDGET_APPLICATION')<MarkApplicationRecord, number>();

export const removeApplication = createStandardAction('REMOVE_WIDGET_APPLICATION')<MarkApplicationRecord, number>();

export const setSignals = createStandardAction('SET_WIDGET_SIGNALS')<InteractionSignal[], number>();
export const deleteWidget = createStandardAction('DELETE_WIDGET')<{groupId: number}, number>(); // id

export const updateWidgetName = createStandardAction('UPDATE_WIDGET_NAME')<string, number>();
