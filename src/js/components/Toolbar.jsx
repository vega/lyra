'use strict';
var React = require('react');

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
            <ul>
              <li>RECT</li>
              <li>SYMBOL</li>
              <li>AREA</li>
              <li>LINE</li>
              <li>TEXT</li>
              <li>EXPORT</li>
              <li><i className="fa fa-file-o"></i> CLEAR</li>
              <li><i className="fa fa-undo"></i> UNDO</li>
              <li><i className="fa fa-repeat"></i> REDO</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Toolbar;
