'use strict';

var React = require('react'),
    AggregateField = require('./AggregateField'),
    AGGREGATE_OPS = require('../../constants/aggregateOps');

var SHORT_LIST = 5;

var TransformsList = React.createClass({
  propTypes: {
    handlers: React.PropTypes.object.isRequired,
    style: React.PropTypes.object,
    field: React.PropTypes.object
  },

  getInitialState: function() {
    return {fullList: false};
  },

  componentWillReceiveProps: function(newProps) {
    if (newProps.field !== this.props.field) {
      this.setState({fullList: false});
    }
  },

  expand: function() {
    this.setState({fullList: true});
  },

  render: function() {
    var props = this.props,
        fullList = this.state.fullList,
        aggs = AGGREGATE_OPS.slice(0, fullList ? undefined : SHORT_LIST);

    return (
      <div className="aggregates-list" style={props.style}>
        {aggs.map(function(agg, i) {
          return (
            <AggregateField op={agg} key={i} field={props.field} {...props.handlers} />
          );
        })}

        {!fullList ? (
          <div className="more full field derived" onClick={this.expand}>+ More</div>
        ) : null}
      </div>
    );
  }
});

module.exports = TransformsList;
