'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    historyActions = require('../../actions/historyActions'),
    undo = historyActions.undo,
    redo = historyActions.redo,
    assets = require('../../util/assets'),
    Icon = require('../Icon'),
    propTypes = require('prop-types'),
    createReactClass = require('create-react-class');

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

var UndoRedo = createReactClass({
  propTypes: {
    canUndo: propTypes.bool.isRequired,
    canRedo: propTypes.bool.isRequired,
    undo: propTypes.func.isRequired,
    redo: propTypes.func.isRequired,
  },

  render: function() {
    var props = this.props;
    return (
      <ul>
        <li onClick={props.undo} className={!props.canUndo ? 'grey' : ''}>
          <Icon glyph={assets.undo} className="undo" width="12" height="12" />
        </li>

        <li onClick={props.redo} className={!props.canRedo ? 'grey' : ''}>
          <Icon glyph={assets.redo} className="redo" width="12" height="12" />
        </li>
      </ul>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(UndoRedo);
