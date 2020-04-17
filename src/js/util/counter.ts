import * as lyraActions from '../actions/lyraActions';
import {Dispatch} from 'redux';
import {State} from '../store';

export function assignId(dispatch: Dispatch, state: State): number {
  const id = state.getIn(['lyra', 'idCounter']);
  dispatch(lyraActions.incrementCounter());
  return id;
}
