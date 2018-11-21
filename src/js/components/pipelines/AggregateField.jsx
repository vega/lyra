'use strict';

var React = require('react'),
    AGGREGATE_OPS = require('../../constants/aggregateOps'),
    propTypes = require('prop-types'),
    createReactClass = require('create-react-class');

var AggregateField = createReactClass({
  propTypes: {
    op: propTypes.oneOf(AGGREGATE_OPS).isRequired,
    field: propTypes.object,
    onDragStart: propTypes.func.isRequired,
    onDragOver: propTypes.func.isRequired,
    onDragEnd: propTypes.func.isRequired,
    onDrop: propTypes.func.isRequired
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
