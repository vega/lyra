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
  formula: () => void;
}

function mapDispatch(dispatch: Dispatch, ownProps: OwnProps): DispatchProps {
  return {
    formula: function() {
      const field = ownProps.field.name;
      dispatch(addTransform({type: 'formula', as: 'calc_' + field, expr: 'datum.' + field}, ownProps.dsId));
    }
  };
}

export class FormulaIcon extends React.Component<OwnProps & DispatchProps> {

  public render() {
    return (<Icon onClick={this.props.formula}
      glyph={assets.formula} width='10' height='10'
      data-tip='Calculate a new field' />);
  }

}

export default connect(null, mapDispatch)(FormulaIcon);
