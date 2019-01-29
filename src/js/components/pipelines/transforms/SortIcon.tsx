import * as React from 'react';
import { connect } from 'react-redux';
import * as ReactTooltip from 'react-tooltip';
import { Dispatch } from 'redux';
import {State} from '../../../store';
import {ColumnRecord} from '../../../store/factory/Dataset';
import { Icon } from '../../Icon';

const Immutable = require('immutable');
const sortDataset = require('../../../actions/datasetActions').sortDataset;
const assets = require('../../../util/assets');
const getInVis = require('../../../util/immutable-utils').getInVis;
const ORDER  = require('../../../constants/sortOrder');
const MTYPES = require('../../../constants/measureTypes');

interface OwnProps {
  field: ColumnRecord;
  dsId: number;
}

interface StateProps {
  sort: any; // Immutable.Map
}

interface DispatchProps {
  sortDataset: (dsId: number, field: any, order: any) => void;
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  return {
    sort: getInVis(state, 'datasets.' + ownProps.dsId + '._sort')
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps): DispatchProps {
  return {
    sortDataset: function(dsId, field, order) {
      dispatch(sortDataset(dsId, field, order));
    }
  };
}

class SortIcon extends React.Component<OwnProps & StateProps & DispatchProps> {

  public componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  public sort(evt) {
    const props = this.props;
    const sort  = props.sort;
    const field = props.field.name;
    const dsId = props.dsId;

    if (sort && sort.get('field') === field) {
      props.sortDataset(dsId, field,
        sort.get('order') === ORDER.ASC ? ORDER.DESC : ORDER.ASC);
    } else {
      props.sortDataset(dsId, field, ORDER.ASC);
    }
  }

  public render() {
    const props = this.props;
    const sort  = props.sort;
    const field = props.field;
    const mtype = field.mtype;
    let isAsc
    let tip;

    if (sort && sort.get('field') === field.name) {
      isAsc = sort.get('order') === ORDER.ASC;
      tip = 'Sorted in ' + (isAsc ? 'ascending' : 'descending') + ' order.';

      return mtype === MTYPES.NOMINAL ?
        (<Icon onClick={this.sort} width='10' height='10'
          glyph={isAsc ? assets.sortAlphaAsc : assets.sortAlphaDesc}
          data-tip={tip} />) :

        (<Icon onClick={this.sort} width='10' height='10'
          glyph={isAsc ? assets.sortNumericAsc : assets.sortNumericDesc}
          data-tip={tip} />);
    }

    return (<Icon onClick={this.sort} glyph={assets.sort}
      width='10' height='10' data-tip='Sort' />);
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SortIcon);
