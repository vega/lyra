'use strict';
var React = require('react'),
    Immutable = require('immutable'),
    connect = require('react-redux').connect,
    ExpressionTextbox = require('../ExpressionTextbox').connected,
    editTransform = require('../../../../actions/datasetActions').editTransform;

function mapStateToProps(state, ownProps) {
  return {};
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    editTransform: function(dsId, oldSpec, newSpec) {
      dispatch(editTransform(dsId, oldSpec, newSpec));
    }
  };
}

var Formula = React.createClass({
  propTypes: {
    dsId:  React.PropTypes.number,
    spec:  React.PropTypes.object
  },

  transform: function(expr) {
    var props = this.props,
        id = props.dsId,
        oldSpec = props.spec,
        newSpec = Object.assign({}, oldSpec);

    newSpec.expr = expr;
    props.editTransform(id, oldSpec, newSpec);
  },

  render: function() {
    var props = this.props,
        spec = props.spec,
        expr = 'formula: ' + spec.expr,
        id = props.dsId;

    return (
      <ExpressionTextbox label={expr} {...this.props} transform={this.transform} />
    );
  }
});

module.exports = {
  connected: connect(mapStateToProps, mapDispatchToProps)(Formula),
  disconnected: Formula
}
