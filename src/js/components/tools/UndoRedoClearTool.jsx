'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    model = require('../../model'),
    markUtil = require('../../util/mark-add-delete');

// Split out into each section
var UndoRedoClear = React.createClass({
  mixins: [markUtil],
  classNames: 'undo-redo-clear',
  clearAndUpdate: function(){
    this.clearMarks();
    this.updateSidebar();
  },
  render: function() {
    return (
      <ul className={this.classNames}>
        <li onClick={this.clearAndUpdate.bind(null, '')}>CLEAR ALL</li>
        <li><i className="fa fa-undo"></i> UNDO</li>
        <li><i className="fa fa-repeat"></i> REDO</li>
      </ul>
    );
  }
});

module.exports = UndoRedoClear;
