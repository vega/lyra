'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    Immutable = require('immutable'),
    assets = require('../../../util/assets'),
    getInVis = require('../../../util/immutable-utils').getInVis,
    Icon   = require('../../Icon'),
    addTransform = require('../../../actions/datasetActions').addTransform;

function mapStateToProps(state, ownProps) {
  return {};
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    addTransform: function(dsId, transformSpec) {
      dispatch(addTransform(dsId, transformSpec));
    }
  };
}

var FilterField = React.createClass({

  propTypes: {
    field: React.PropTypes.object.isRequired,
    dsId:  React.PropTypes.number,
  },

  filter: function(evt) {
    var props = this.props,
        dsId = props.dsId,
        test = 'datum.' + props.field.name,
        transform = {
          type: 'filter',
          test: test
        };

    this.props.addTransform(dsId, transform);

  },

  render: function() {
    return (<Icon onClick={this.filter} glyph={assets.filter} width="10" height="10"
    data-tip="Filter" />);
  }
});

module.exports = {
  connected: connect(mapStateToProps, mapDispatchToProps)(FilterField),
  disconnected: FilterField
}
