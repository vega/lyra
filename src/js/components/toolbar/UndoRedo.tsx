'use strict';

// TODO Change from 'requires' to 'import'
const assets = require('../../util/assets');

import * as React from 'react';
import {connect} from 'react-redux';
import {ActionCreators, canUndo, canRedo} from 'redux-undo/src';
import {canUseUnaggregatedDomain} from 'vega-lite/src/compile/scale/domain';
import {State} from '../../store';
import {Icon} from '../Icon';

interface StateProps {
  canUndo: boolean;
  canRedo: boolean;
}
interface DispatchProps {
  undo: () => void;
  redo: () => void;
}

function mapStateToProps(state: State): StateProps {
  const vis = state.vis;
  return {
    canUndo: canUndo(vis),
    canRedo: canRedo(vis)
  };
}

export class BaseUndoRedo extends React.PureComponent<StateProps & DispatchProps> {
  public render() {
    const props = this.props;
    return (
      <ul className='undo-redo'>
        <li onClick={props.canUndo ? props.undo : null} className={!props.canUndo ? 'grey' : ''}>
          <Icon glyph={assets.undo} className='undo' width='12' height='12' />
        </li>

        <li onClick={props.canRedo ? props.redo : null} className={!props.canRedo ? 'grey' : ''}>
          <Icon glyph={assets.redo} className='redo' width='12' height='12' />
        </li>
      </ul>
    );
  }
}
export const UndoRedo = connect(mapStateToProps, ActionCreators)(BaseUndoRedo);
