'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    selectMark = require('../../actions/selectMark'),
    sceneClear = require('../../actions/sceneClear'),
    assets = require('../../util/assets'),
    Icon = require('../Icon');

function mapDispatchToProps(dispatch) {
  return {
    clearScene: function() {
      dispatch(selectMark(null));
      dispatch(sceneClear());
    }
  };
}

// Split out into each section
var UndoRedoClear = React.createClass({
  propTypes: {
    clearScene: React.PropTypes.func
  },
  classNames: 'undo-redo-clear',
  render: function() {
    return (
      <ul className={this.classNames}>
        <li onClick={this.props.clearScene}>Clear All</li>
        <li><Icon glyph={assets.undo} className="undo" /></li>
        <li><Icon glyph={assets.redo} className="redo" /></li>
      </ul>
    );
  }
});

module.exports = connect(null, mapDispatchToProps)(UndoRedoClear);
