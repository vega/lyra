import {Record, RecordOf} from 'immutable';
import {ConnectedComponentClass} from 'react-redux';
import {AnyAction} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {State} from '../../store';

interface BaseHintsDisplay {
  action_text?: string,
  action?: (...args: any) => (AnyAction | ThunkAction<void, State, null, AnyAction>), // callback for the button's onClick event
  action_props?: any // any properties that will be passed in the action event
}
export interface HintsPropsDisplay extends BaseHintsDisplay {
  title: string,
  text: string,
}

export interface HintsTemplateDisplay extends BaseHintsDisplay {
  template?: ConnectedComponentClass<React.Component, any>
}

export type HintsDisplay = HintsPropsDisplay | HintsTemplateDisplay;

interface LyraHints {
  display: HintsDisplay;
  on: boolean;
}

export const Hints = Record<LyraHints>({
  display: null,
  on: false
}, 'LyraHints');

export type HintsRecord = RecordOf<LyraHints>;
