'use strict';
var React = require('react'),
    AddMarks = require('./toolbar/AddMarks'),
    UndoRedo = require('./toolbar/UndoRedo'),
    Export = require('./toolbar/Export'),
    Record = require('./toolbar/Record'),
    assets = require('../util/assets'),
    Icon = require('./Icon');

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
            <AddMarks />
            <UndoRedo />
            <Record />
            <Export />
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Toolbar;
