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
    editTransform: function(dsId, specId, newSpec) {
      dispatch(editTransform(dsId, specId, newSpec));
    }
  };
}

var Formula = React.createClass({
  propTypes: {
    dsId:  React.PropTypes.number,
    specId: React.PropTypes.number, // represents index of transform array in store
    spec:  React.PropTypes.object
  },

  transform: function(expr) {
    var props = this.props,
        id = props.dsId,
        specId = props.specId,
        newSpec = Object.assign({}, props.spec);

    newSpec.expr = expr;
    props.editTransform(id, specId, newSpec);
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
