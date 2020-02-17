import * as React from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip'
import {sortDataset} from '../../../actions/datasetActions';
import {State} from '../../../store';
import {ColumnRecord} from '../../../store/factory/Dataset';
import { Icon } from '../../Icon';

import {Compare} from 'vega-typings/types';
import {SortOrderValues} from '../../../constants/sortOrder';

const assets = require('../../../util/assets');
const getInVis = require('../../../util/immutable-utils').getInVis;
const MTYPES = require('../../../constants/measureTypes');

interface OwnProps {
  field: ColumnRecord;
  dsId: number;
}

interface StateProps {
  sort: Compare;
}

interface DispatchProps {
  sortDataset: (payload: Compare, dsId: number) => void;
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  return {
    sort: getInVis(state, 'datasets.' + ownProps.dsId + '._sort')
  };
}

const mapDispatch: DispatchProps = {
  sortDataset
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

    if (sort && sort.field === field) {
      props.sortDataset({field,
        order: sort.order === SortOrderValues.Asc ? SortOrderValues.Desc : SortOrderValues.Asc}, dsId);
    } else {
      props.sortDataset({field, order: SortOrderValues.Asc}, dsId);
    }
  }

  public render() {
    const props = this.props;
    const sort  = props.sort;
    const field = props.field;
    const mtype = field.mtype;
    let isAsc
    let tip;

    if (sort && sort.field === field.name) {
      isAsc = sort.order === SortOrderValues.Asc;
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

export default connect(mapStateToProps, mapDispatch)(SortIcon);
