import * as React from 'react';
import { Export } from './Export';

const AddMarks = require('./AddMarks'),
  UndoRedo = require('./UndoRedo'),
  assets = require('../../util/assets'),
  Icon = require('../Icon');

export class Toolbar extends React.PureComponent {
  public render() {
    return (
      <div className="toolbar">
        <div className="toolbar-menu">
          <input type="checkbox" id="nav-trigger" className="nav-trigger" />
          <label htmlFor="nav-trigger">
            <Icon glyph={assets.hamburger} />
          </label>
          <div className="menu">
            <AddMarks />
            <UndoRedo />
            <Export />
          </div>
        </div>
      </div>
    );
  }
}
