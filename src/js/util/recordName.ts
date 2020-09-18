
import {State} from '../store';

export function recordName(state: State, entity: string, label: string): string {
  const num = state.getIn(['vis', 'present', entity]).size;
  return label + ' ' + (num + 1);
}
