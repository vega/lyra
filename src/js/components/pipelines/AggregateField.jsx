'use strict';

var React = require('react');

var AggregateField = React.createClass({
  wrapDragEndTransform: function(evt) {
    var props = this.props;
    props.onDragEnd(evt, props.aggregationName);
  },
  render: function() {
    var props = this.props;
    return (
      <div draggable={true}
        onDragStart={props.onDragStart}
        onDragOver={props.onDragOver}
        onDragEnd={this.wrapDragEndTransform}
        onDrop={props.onDrop}
        className="aggregate-field">
        {props.aggregationName} - {props.field}
      </div>
    );
  }
});

module.exports = AggregateField;
