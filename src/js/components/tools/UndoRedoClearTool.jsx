'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    selectMark = require('../../actions/selectMark'),
    sceneClear = require('../../actions/sceneClear');

function mapDispatchToProps(dispatch) {
  return {
    clearScene: function() {
      console.log('here');
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
        <li><i className="fa fa-undo"></i> UNDO</li>
        <li><i className="fa fa-repeat"></i> REDO</li>
      </ul>
    );
  }
});

module.exports = connect(null, mapDispatchToProps)(UndoRedoClear);
