'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    assets = require('../../../util/assets'),
    Icon = require('../../Icon'),
    addTransform = require('../../../actions/datasetActions').addTransform,
    propTypes = require('prop-types'),
    createReactClass = require('create-react-class');

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

var FilterIcon = createReactClass({
  propTypes: {
    field: propTypes.object.isRequired,
    dsId:  propTypes.number,
    filter: propTypes.func
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
