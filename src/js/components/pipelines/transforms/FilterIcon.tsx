import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import {State} from '../../../store';

const assets = require('../../../util/assets');
const Icon = require('../../Icon');
const addTransform = require('../../../actions/datasetActions').addTransform;

interface OwnProps {
  field: object;
  dsId: number;
}
interface DispatchProps {
  filter: () => any;
}

function mapStateToProps(state: State, ownProps) {
  return {};
}

function mapDispatchToProps(dispatch: Dispatch, ownProps): DispatchProps {
  return {
    filter: function() {
      dispatch(addTransform(ownProps.dsId,
        {type: 'filter', test: 'datum.' + ownProps.field.name}));
    }
  };
}

export class FilterIcon extends React.Component<DispatchProps> {

  public render() {
    return (<Icon onClick={this.props.filter} glyph={assets.filter}
      width='10' height='10'
      data-tip='Filter' />);
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterIcon);
