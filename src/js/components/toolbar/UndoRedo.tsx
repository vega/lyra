'use strict';

// TODO Change from 'requires' to 'import'
const assets = require('../../util/assets');

import * as React from 'react';
import {connect} from 'react-redux';
import {redo, undo} from '../../actions/historyActions';
import {State} from '../../store';
import { Icon } from '../Icon';

interface StateProps {
  canUndo: boolean;
  canRedo: boolean;
}
interface DispatchProps {
  undo: () => void;
  redo: () => void;
}

function mapStateToProps(state: State): StateProps {
  const vis = state.get('vis');
  return {
    canUndo: vis.past.size > 0,
    canRedo: vis.future.size > 0
  };
}

const mapDispatch: DispatchProps = {
  undo,
  redo
}

export class BaseUndoRedo extends React.PureComponent<StateProps & DispatchProps> {
  public render() {
    const props = this.props;
    return (
      <ul>
        <li onClick={props.undo} className={!props.canUndo ? 'grey' : ''}>
          <Icon glyph={assets.undo} className='undo' width='12' height='12' />
        </li>

        <li onClick={props.redo} className={!props.canRedo ? 'grey' : ''}>
          <Icon glyph={assets.redo} className='redo' width='12' height='12' />
        </li>
      </ul>
    );
  }
}
export const UndoRedo = connect(mapStateToProps, mapDispatch)(BaseUndoRedo);
