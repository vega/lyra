'use strict';
var React = require('react'),
    assets = require('../../util/assets'),
    Icon = require('../Icon');

var UndoRedo = React.createClass({
  render: function() {
    return (
      <ul>
        <li><Icon glyph={assets.undo} className="undo" width="12" height="12" /></li>
        <li><Icon glyph={assets.redo} className="redo" width="12" height="12" /></li>
      </ul>
    );
  }
});

module.exports = UndoRedo;
