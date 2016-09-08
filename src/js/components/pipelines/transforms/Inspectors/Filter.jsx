'use strict';
var React = require('react'),
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

var Filter = React.createClass({
  propTypes: {
    dsId:  React.PropTypes.number,
    specId:  React.PropTypes.number, // represents index of transform array in store
    spec: React.PropTypes.object
  },

  transform: function(newTest) {
    var props = this.props,
        id = props.dsId,
        specId = props.specId,
        newSpec = Object.assign({}, props.spec);

    newSpec.test = newTest;
    props.editTransform(id, specId, newSpec);
  },

  render: function() {
    var props = this.props,
        spec = props.spec,
        test = 'filter: ' + spec.test;

    return <ExpressionTextbox label={test} {...this.props} transform={this.transform} />;
  }
});

module.exports = {
  connected: connect(mapStateToProps, mapDispatchToProps)(Filter),
  disconnected: Filter
};
