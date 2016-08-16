'use strict';

var React = require('react'),
    DraggableFields = require('../mixins/DraggableFields');

var AggregateField = React.createClass({
  propTypes: {
    dsId: React.PropTypes.number,
    className: React.PropTypes.string.isRequired,
    def: React.PropTypes.object,
    schema: React.PropTypes.object
  },
  mixins: [DraggableFields],
  render: function() {
    var props = this.props;
    return (
      <div draggable={true}
        onDragStart={this.handleDragStart}
        onDragOver={this.handleDragOver}
        onDragEnd={this.handleDragEnd}
        className={'aggregate-field ' + props.className}>
        {props.aggregationName} - {props.field}
      </div>
    );
  }
});

module.exports = AggregateField;
