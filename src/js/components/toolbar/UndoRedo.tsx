'use strict';
// TODO Change from 'requires' to 'import'
const historyActions = require('../../actions/historyActions');
const undo = historyActions.undo;
const redo = historyActions.redo;
const assets = require('../../util/assets');
const Icon = require('../Icon');

import * as createReactClass from 'create-react-class';
import * as propTypes from 'prop-types';
import * as React from 'react';
import {connect} from 'react-redux';
import {State} from '../../store/index';

function mapStateToProps(state: State) {
  const vis = state.get('vis');
  return {
    canUndo: vis.past.length > 0,
    canRedo: vis.future.length > 0
  };
}

function mapDispatchToProps(dispatch: any) {
  return {
    undo: () => {
      dispatch(undo());
    },
    redo: () => {
      dispatch(redo());
    }
  };
}

export interface UndoRedoProps {
  canUndo: boolean,
  canRedo: boolean,
  undo: any,
  redo: any
}

export class BaseUndoRedo extends React.PureComponent<UndoRedoProps, {}> {
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
export const UndoRedo = connect(mapStateToProps, mapDispatchToProps)(BaseUndoRedo);
