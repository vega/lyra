'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    historyActions = require('../../actions/historyActions'),
    undo = historyActions.undo,
    redo = historyActions.redo,
    assets = require('../../util/assets'),
    Icon = require('../Icon');

function mapStateToProps(state) {
  var vis = state.get('vis');
  return {
    canUndo: vis.past.length > 0,
    canRedo: vis.future.length > 0
  };
}

function mapDispatchToProps(dispatch) {
  return {
    undo: function() {
      dispatch(undo());
    },
    redo: function() {
      dispatch(redo());
    }
  };
}

var UndoRedo = React.createClass({
  propTypes: {
    canUndo: React.PropTypes.bool.isRequired,
    canRedo: React.PropTypes.bool.isRequired,
    undo: React.PropTypes.func.isRequired,
    redo: React.PropTypes.func.isRequired,
  },

  render: function() {
    var props = this.props;
    return (
      <ul>
        <li onClick={props.undo}>
          <Icon glyph={assets.undo} className={'undo' + (!props.canUndo ? ' grey' : '')}
            width="12" height="12" />
        </li>

        <li onClick={props.redo}>
          <Icon glyph={assets.redo} className={'redo' + (!props.canRedo ? ' grey' : '')}
            width="12" height="12" />
        </li>
      </ul>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(UndoRedo);
