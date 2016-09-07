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
      console.log('editTransform()');
      dispatch(editTransform(dsId, oldSpec, newSpec));
    }
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
        test = 'filter: ' + spec.test,
        id = props.dsId;

    return <ExpressionTextbox label={test} dsId={id}  oldSpec={spec} {...this.props} />
  }
});

module.exports = {
  connected: connect(mapStateToProps, mapDispatchToProps)(Filter),
  disconnected: Filter
}
