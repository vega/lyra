'use strict';

var React = require('react');

var AggregateField = React.createClass({
  render: function() {
    var props = this.props;
    return (
      <div draggable={true}
        onDragStart={props.onDragStart}
        onDragOver={props.onDragOver}
        onDragEnd={props.onDragEnd}
        onDrop={props.onDrop}
        className="aggregate-field">
        {props.aggregationName} - {props.field}
      </div>
    );
  }
});

module.exports = AggregateField;
