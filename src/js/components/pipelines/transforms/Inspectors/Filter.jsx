'use strict';
var React = require('react'),
    Immutable = require('immutable'),
    connect = require('react-redux').connect,
    ExpressionTextbox = require('../ExpressionTextbox').connected;

function mapStateToProps(state, ownProps) {
  return {};
}

function mapDispatchToProps(dispatch, ownProps) {
  return {

  };
}

var Filter = React.createClass({
  propTypes: {
    dsId:  React.PropTypes.number,
    spec:  React.PropTypes.object
  },

  render: function() {
    var props = this.props,
        spec = props.spec,
        test = spec.test,
        id = props.dsId;

    return <ExpressionTextbox label={test} dsId={id} />
  }
});

module.exports = {
  connected: connect(mapStateToProps, mapDispatchToProps)(Filter),
  disconnected: Filter
}
