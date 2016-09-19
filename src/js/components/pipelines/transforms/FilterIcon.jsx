'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    assets = require('../../../util/assets'),
    Icon = require('../../Icon'),
    addTransform = require('../../../actions/datasetActions').addTransform;

function mapStateToProps(state, ownProps) {
  return {};
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    filter: function() {
      dispatch(addTransform(ownProps.dsId,
        {type: 'filter', test: 'datum.' + ownProps.field.name}));
    }
  };
}

var FilterIcon = React.createClass({
  propTypes: {
    field: React.PropTypes.object.isRequired,
    dsId:  React.PropTypes.number,
    filter: React.PropTypes.func
  },

  render: function() {
    return (<Icon onClick={this.props.filter} glyph={assets.filter}
      width="10" height="10"
      data-tip="Filter" />);
  }
});

module.exports = {
  connected: connect(mapStateToProps, mapDispatchToProps)(FilterIcon),
  disconnected: FilterIcon
};
