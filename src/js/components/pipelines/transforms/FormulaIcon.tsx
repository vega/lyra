import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import {State} from '../../../store';

const assets = require('../../../util/assets');
const Icon = require('../../Icon');
const addTransform = require('../../../actions/datasetActions').addTransform;

interface OwnProps {
  field: any;
  dsId: number;
}
interface DispatchProps {
  formula: () => any;
}

function mapStateToProps(state: State, ownProps: OwnProps) {
  return {};
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps): DispatchProps {
  return {
    formula: function() {
      const field = ownProps.field.name;
      dispatch(addTransform(ownProps.dsId,
        {type: 'formula', field: 'calc_' + field, expr: 'datum.' + field}));
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

export default connect(mapStateToProps, mapDispatchToProps)(FormulaIcon);
