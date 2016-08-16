'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    sortDataset = require('../../actions/datasetActions').sortDataset,
    assets = require('../../util/assets'),
    Icon   = require('../Icon'),
    getInVis = require('../../util/immutable-utils').getInVis;

function mapStateToProps(state, ownProps) {
  return {
    dataset: getInVis(state, 'datasets.' + ownProps.dsId)
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    sortDataset: function(dsId, sortField, sortOrder) {
      dispatch(sortDataset(dsId, sortField, sortOrder));
    }
  };
}

var SortField = React.createClass({

  propTypes: {
    field: React.PropTypes.object,
    dsId: React.PropTypes.number.isRequired
  },

  isSortAsc: function() {
    var dataset = this.props.dataset.toJS(),
        sort = dataset._sort,
        result = null;

    if (sort) {
      result = sort == 'asc';
    }

    return result;
  },

  sort: function(evt) {
    var valuesAsc = null,
        props = this.props,
        field = props.field,
        id = props.dsId,
        ascOrDesc = isSortAsc(props.dataset);

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
        props = this.props,
        field = this.props.field,
        sortAsc = isSortAsc(props.dataset);

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

function isSortAsc(dataset) {
  var dataset = dataset.toJS(),
      sort = dataset._sort,
      result = null;

  if (sort) {
    result = sort == 'asc';
  }

  return result;
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SortField);
