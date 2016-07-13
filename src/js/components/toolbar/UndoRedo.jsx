'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    History = require('redux-undo').ActionCreators,
    assets = require('../../util/assets'),
    Icon = require('../Icon');

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    undo: function() {
      dispatch(History.undo());
    },
    redo: function() {
      dispatch(History.redo());
    }
  };
}

var UndoRedo = React.createClass({
  propTypes: {
    undo: React.PropTypes.func.isRequired,
    redo: React.PropTypes.func.isRequired,
  },

  render: function() {
    var props = this.props;
    return (
      <ul>
        <li onClick={props.undo}>
          <Icon glyph={assets.undo} className="undo" width="12" height="12" />
        </li>

        <li onClick={props.redo}>
          <Icon glyph={assets.redo} className="redo" width="12" height="12" />
        </li>
      </ul>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(UndoRedo);
