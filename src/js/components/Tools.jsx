'use strict';
var React = require('react');

// Splitting each sidebar into its column
var Tools = React.createClass({
  classNames: 'toolbar push6',
  render: function() {
    return (
      <div className={this.classNames}>
        <ul>
          <li>RECT</li>
          <li>SYMBOL</li>
          <li>AREA</li>
          <li>LINE</li>
          <li>TEXT</li>
          <li>|</li>
          <li>EXPORT</li>
          <li>|</li>
          <li><i className="fa fa-file-o"></i> CLEAR</li>
          <li><i className="fa fa-undo"></i> UNDO</li>
          <li><i className="fa fa-repeat"></i> REDO</li>
        </ul>
      </div>
    );
  }
});

module.exports = Tools;
