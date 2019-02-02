import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import {addTransform} from '../../../actions/datasetActions';
import {ColumnRecord} from '../../../store/factory/Dataset';
import { Icon } from '../../Icon';

const assets = require('../../../util/assets');

interface OwnProps {
  field: ColumnRecord;
  dsId: number;
}
interface DispatchProps {
  filter: () => any;
}

function mapDispatch(dispatch: Dispatch, ownProps: OwnProps): DispatchProps {
  return {
    filter: function() {
      dispatch(addTransform({type: 'filter', expr: 'datum.' + ownProps.field.name}, ownProps.dsId));
    }
  };
}

export class FilterIcon extends React.Component<OwnProps & DispatchProps> {

  public render() {
    return (<Icon onClick={this.props.filter} glyph={assets.filter}
      width='10' height='10'
      data-tip='Filter' />);
  }
}

export default connect(null, mapDispatch)(FilterIcon);
