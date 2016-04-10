'use strict';
var React = require('react'),
    AddMarksTool = require('./tools/AddMarksTool'),
    UndoRedoClearTool = require('./tools/UndoRedoClearTool'),
    assets = require('../util/assets'),
    Icon = require('./Icon');

// Splitting each sidebar into its column
var Toolbar = React.createClass({
  render: function() {
    return (
      <div className="toolbar">
        <div className="toolbar-menu">
          <input type="checkbox" id="nav-trigger" className="nav-trigger" />
          <label htmlFor="nav-trigger">
            <Icon glyph={assets.hamburger} />
          </label>
          <div className="menu">
            <AddMarksTool/>
            <UndoRedoClearTool/>
            <ul>
              <li>EXPORT</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Toolbar;
