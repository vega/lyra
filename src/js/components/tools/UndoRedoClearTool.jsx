'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    assets = require('../../util/assets'),
    Icon = require('../Icon');

// Split out into each section
var UndoRedoClear = React.createClass({
  classNames: 'undo-redo-clear',
  render: function() {
    return (
      <ul className={this.classNames}>
        <li><Icon glyph={assets.undo} className="undo" /></li>
        <li><Icon glyph={assets.redo} className="redo" /></li>
      </ul>
    );
  }
});

module.exports = UndoRedoClear;
