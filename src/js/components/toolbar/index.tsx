import * as React from 'react';
import { Icon } from '../Icon';
import { AddMarks } from './AddMarks';
import { AddInteractions } from './AddInteractions';
import { Export } from './Export';
import {Persist} from './Persist';
import { UndoRedo } from './UndoRedo';
import {Feedback} from './Feedback';
import {ExampleGallery} from './ExampleGallery';

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
            <div className='menu-group'>
              <AddMarks />
              <AddInteractions />
              <UndoRedo />
              <Persist />
              <Export />
            </div>
            <div className='menu-group'>
              <ExampleGallery />
            </div>
            <div className='menu-group'>
              <Feedback />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
