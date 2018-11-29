import * as React from 'react';
import { AddMarks } from './AddMarks';
import { Export } from './Export';
import { UndoRedo } from './UndoRedo';

const assets = require('../../util/assets'),
      Icon = require('../Icon');

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
            <Export />
          </div>
        </div>
      </div>
    );
  }
}
