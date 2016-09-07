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

var Filter = React.createClass({
  propTypes: {
    dsId:  React.PropTypes.number,
    spec:  React.PropTypes.object
  },

  transform: function(newTest) {
    var props = this.props,
        id = props.dsId,
        oldSpec = props.spec,
        newSpec = Object.assign({}, oldSpec);

    newSpec.test = newTest;
    props.editTransform(id, oldSpec, newSpec);
  },

  render: function() {
    var props = this.props,
        spec = props.spec,
        test = 'filter: ' + spec.test,
        id = props.dsId;

    return <ExpressionTextbox label={test} {...this.props} transform={this.transform} />
  }
});

module.exports = {
  connected: connect(mapStateToProps, mapDispatchToProps)(Filter),
  disconnected: Filter
}
