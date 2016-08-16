'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    sortDataset = require('../../actions/datasetActions').sortDataset,
    assets = require('../../util/assets'),
    Icon   = require('../Icon'),
    getInVis = require('../../util/immutable-utils').getInVis,
    dsUtil = require('../../util/dataset-utils'),
    store = require('../../store');

function mapStateToProps(state, ownProps) {
  return {};
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    sortDataset: function(dsId, sortField, sortOrder) {
      dispatch(sortDataset(dsId, sortField, sortOrder));
    }
  };
}

function getDataset(id) {
  return getInVis(store.getState(), 'datasets.' + id).toJS();
}

function isSorted(id) {
  var dataset = getDataset(id),
      sort = dataset._sort,
      result = null;

  if (sort) {
    result = sort == 'asc';
  }

  return result;
}

var SortField = React.createClass({

  propTypes: {
    field: React.PropTypes.object,
    dsId: React.PropTypes.number.isRequired
  },

  sort: function(evt) {
    var valuesAsc = null,
        props = this.props,
        field = props.field,
        id = props.dsId,
        ascOrDesc = null,
        valuesAsc = isSorted(id);


    if (valuesAsc == null) {
      // first click default: increasing
      valuesAsc = true;
    } else {
      valuesAsc = !valuesAsc;
    }

    ascOrDesc = valuesAsc ? 'asc' : 'desc';
    this.props.sortDataset(id, field.name, ascOrDesc);
  },

  render: function() {
    var ascOrDescIcon = (
      <Icon onClick={this.sort}
        glyph={assets['sort']} width="10" height="10" />),
        field = this.props.field,
        sortAsc = this.state.valuesAsc,
        id = this.props.dsId,
        sortAsc = isSorted(id);

    if (sortAsc != null) {
      if (field.mtype == 'nominal') {
        ascOrDescIcon = sortAsc ? (
          <Icon onClick={this.sort}
            glyph={assets['sortAlphaAsc']} width="10" height="10" />) : (
          <Icon onClick={this.sort}
            glyph={assets['sortAlphaDesc']} width="10" height="10" />);
      } else if (field.mtype == 'quantitative' || field.mtype == 'temporal') {
        ascOrDescIcon = sortAsc ? (
          <Icon onClick={this.sort}
            glyph={assets['sortNumericAsc']} width="10" height="10" />) : (
          <Icon onClick={this.sort}
            glyph={assets['sortNumericDesc']} width="10" height="10" />);
      }
    }

    return ascOrDescIcon;
  }


});

module.exports = connect(mapStateToProps, mapDispatchToProps)(SortField);
