'use strict';

var React = require('react'),
    AGGREGATION_OPS = require('../../constants/transformTypes').aggregationOps,
    LIST_LIMIT = 5,
    AggregateField = require('./AggregateField');

var TransformsList = React.createClass({
  propTypes: {
    handlers: React.PropTypes.object.isRequired, // use prop shaping
    toggleTransforms: React.PropTypes.func.isRequired,
    style: React.PropTypes.object,
    fieldName: React.PropTypes.string
  },
  getInitialState: function() {
    return {
      listLimit: LIST_LIMIT
    };
  },
  expandTransformsList: function() {
    this.setState({
      listLimit: AGGREGATION_OPS.length
    });
  },
  collapseTransformsList: function() {
    this.setState({
      listLimit: LIST_LIMIT
    });
  },
  render: function() {
    var props = this.props,
        state = this.state,
        transforms = AGGREGATION_OPS.slice(0, state.listLimit),
        aggrHandlers = props.handlers,
        aggregateFieldProps = {
          onDragStart: aggrHandlers.onDragStart,
          onDragOver: aggrHandlers.onDragOver,
          onDragEnd: aggrHandlers.onDragEnd,
          onDrop: aggrHandlers.onDrop
        };

    var listControls = AGGREGATION_OPS.length > state.listLimit ?
      (<li className="transform-item-enum"
        onClick={this.expandTransformsList}>
          <strong>+ More Transforms</strong>
        </li>) : (<li className="transform-item-enum"
          onClick={this.collapseTransformsList}>
            <strong>+ Fewer Transforms</strong>
          </li>);

    return (
      <div className="transforms-menu"
        style={props.style}>
        <ul className="transforms-list">
          {listControls}
          {
            transforms.map(function(transform, i) {
              return (
                <li className="transform-item" key={i}>
                  <AggregateField aggregationName={transform}
                    field={props.fieldName}
                    {...aggregateFieldProps} />
                </li>
              );
            }, this)
          }
          <li className="transform-item-enum"
            onClick={props.toggleTransforms}>
            <strong className="close-transforms">Dismiss</strong>
          </li>
        </ul>
      </div>
    );
  }
});

module.exports = TransformsList;
