'use strict';
var React = require('react'),
    AddMarksTool = require('./tools/AddMarksTool'),
    UndoRedoClearTool = require('./tools/UndoRedoClearTool');

// Splitting each sidebar into its column
var Toolbar = React.createClass({
  classNames: 'toolbar',
  render: function() {
    return (
      <div className={this.classNames}>
        <div className="toolbar-menu">
          <input type="checkbox" id="nav-trigger" className="nav-trigger" />
          <label htmlFor="nav-trigger">
            <i className="fa fa-bars"></i>
          </label>
          <div className="menu">
            <AddMarksTool/>
            <ul>
              <li>EXPORT</li>
            </ul>
            <UndoRedoClearTool/>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Toolbar;
