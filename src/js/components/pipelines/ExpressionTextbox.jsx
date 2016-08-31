'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    filterDataset = require('../../actions/datasetActions').filterDataset,
    Property = require('../inspectors/Property');

function mapStateToProps(state, ownProps) {
  return {};
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    filterDataset: function(dsId, expression) {
      dispatch(filterDataset(dsId, expression));
    }
  };
}

var ExpressionTextbox = React.createClass({
  propTypes: {
    dsId:  React.PropTypes.number
  },

  filter: function(evt) {
    console.log("works");
  },

  render: function() {
    var props = this.props,
        id = props.dsId;

    return (
      <Property name="expressionProp" type="autocomplete"   autoType="expr" dsId={id} {...props} onChange={this.filter}>
      </Property>
    );
  }
});

module.exports = {
  connected: connect(mapStateToProps, mapDispatchToProps)(ExpressionTextbox),
  disconnected: ExpressionTextbox
}
