'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    Immutable = require('immutable'),
    sortDataset = require('../../../actions/datasetActions').sortDataset,
    assets = require('../../../util/assets'),
    Icon   = require('../../Icon'),
    getInVis = require('../../../util/immutable-utils').getInVis,
    ORDER  = require('../../../constants/sortOrder'),
    MTYPES = require('../../../constants/measureTypes'),
    ReactTooltip = require('react-tooltip');

function mapStateToProps(state, ownProps) {
  return {
    sort: getInVis(state, 'datasets.' + ownProps.dsId + '._sort')
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    sortDataset: function(dsId, field, order) {
      dispatch(sortDataset(dsId, field, order));
    }
  };
}

var SortField = React.createClass({
  propTypes: {
    field: React.PropTypes.object.isRequired,
    dsId:  React.PropTypes.number,
    sort:  React.PropTypes.instanceOf(Immutable.Map)
  },

  componentDidUpdate: function() {
    ReactTooltip.rebuild();
  },

  sort: function(evt) {
    var props = this.props,
        sort  = props.sort,
        field = props.field.name,
        dsId = props.dsId;

    if (sort && sort.get('field') === field) {
      props.sortDataset(dsId, field,
        sort.get('order') === ORDER.ASC ? ORDER.DESC : ORDER.ASC);
    } else {
      props.sortDataset(dsId, field, ORDER.ASC);
    }
  },

  render: function() {
    var props = this.props,
        sort  = props.sort,
        field = props.field,
        mtype = field.mtype,
        isAsc, tip;

    if (sort && sort.get('field') === field.name) {
      isAsc = sort.get('order') === ORDER.ASC;
      tip = 'Sorted in ' + (isAsc ? 'ascending' : 'descending') + ' order.';

      return mtype === MTYPES.NOMINAL ?
        (<Icon onClick={this.sort} width="10" height="10"
          glyph={isAsc ? assets.sortAlphaAsc : assets.sortAlphaDesc}
          data-tip={tip} />) :

        (<Icon onClick={this.sort} width="10" height="10"
          glyph={isAsc ? assets.sortNumericAsc : assets.sortNumericDesc}
          data-tip={tip} />);
    }

    return (<Icon onClick={this.sort} glyph={assets.sort}
      width="10" height="10" data-tip="Sort" />);
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(SortField);
