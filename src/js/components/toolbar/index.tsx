import * as React from 'react';
import { Icon } from '../Icon';
import { AddMarks } from './AddMarks';
import { Export } from './Export';
import {Persist} from './Persist';
import { UndoRedo } from './UndoRedo';

const assets = require('../../util/assets');

export class Toolbar extends React.PureComponent {
  public render() {
    return (
      <div className='toolbar'>
        <div className='toolbar-menu'>
          <input type='checkbox' id='nav-trigger' className='nav-trigger' />
          <label htmlFor='nav-trigger'>
            <Icon glyph={assets.hamburger} />
          </label>
          <div className='menu'>
            <AddMarks />
            <UndoRedo />
            <Persist />
            <Export />
          </div>
        </div>
      </div>
    );
  }
}
