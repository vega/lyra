'use strict';

var React = require('react'),
    AGGREGATE_OPS = require('../../constants/aggregateOps');

var AggregateField = React.createClass({
  propTypes: {
    op: React.PropTypes.oneOf(AGGREGATE_OPS).isRequired,
    field: React.PropTypes.object,
    onDragStart: React.PropTypes.func.isRequired,
    onDragOver: React.PropTypes.func.isRequired,
    onDragEnd: React.PropTypes.func.isRequired,
    onDrop: React.PropTypes.func.isRequired
  },

  onDragEnd: function(evt) {
    var props = this.props;
    props.onDragEnd(evt, {aggregate: props.op});
  },

  render: function() {
    var props = this.props,
        field = props.field,
        fieldName = field ? field.name : null;

    return (
      <div className={'full field derived aggregate-field'} draggable={true}
        onDragStart={props.onDragStart}
        onDragOver={props.onDragOver}
        onDragEnd={this.onDragEnd}
        onDrop={props.onDrop}>
        <strong>{props.op}</strong>_{fieldName}
      </div>
    );
  }
});

module.exports = AggregateField;
