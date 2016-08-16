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
    dsId: React.PropTypes.number.isRequired,
    dataset: React.PropTypes.object
  },

  sort: function(evt) {
    var props = this.props,
        valuesAsc = isSortAsc(props.dataset),
        field = props.field,
        id = props.dsId,
        ascOrDesc = null;

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
        glyph={assets.sort} width="10" height="10" />),
        props = this.props,
        field = this.props.field,
        sortAsc = isSortAsc(props.dataset);

    if (sortAsc != null) {
      if (field.name === getFieldName(props.dataset.toJS()._sort.sortField)) {
        if (field.mtype === 'nominal') {
          ascOrDescIcon = sortAsc ? (
            <Icon onClick={this.sort}
              glyph={assets.sortAlphaAsc} width="10" height="10" />) : (
            <Icon onClick={this.sort}
              glyph={assets.sortAlphaDesc} width="10" height="10" />);
        } else if (field.mtype === 'quantitative' || field.mtype === 'temporal') {
          ascOrDescIcon = sortAsc ? (
            <Icon onClick={this.sort}
              glyph={assets.sortNumericAsc} width="10" height="10" />) : (
            <Icon onClick={this.sort}
              glyph={assets.sortNumericDesc} width="10" height="10" />);
        }
      }
    }

    return ascOrDescIcon;
  }
});

function isSortAsc(dataset) {
  var ds = dataset.toJS(),
      sort = ds._sort,
      result = null;

  if (sort) {
    result = sort.sortOrder === 'asc';
  }

  return result;
}

function getFieldName(sortField) {
  if (sortField.charAt(0) === '-') {
    return sortField.substring(1);
  } else {
    return sortField;
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(SortField);
