import * as React from 'react';
import {connect} from 'react-redux';
import {Dispatch} from 'redux';
import {addTransform} from '../../../actions/datasetActions';
import {State} from '../../../store';
import {ColumnRecord} from '../../../store/factory/Dataset';
import {PipelineRecord} from '../../../store/factory/Pipeline';
import {Icon} from '../../Icon';

const assets = require('../../../util/assets');

interface OwnProps {
  field: ColumnRecord;
  dsId: number;
}

interface StateProps {
  size: number;
  from: number;
}

interface DispatchProps {
  lookup: (from: number) => void;
}

function mapState(state: State, ownProps: OwnProps): StateProps {
  const pipelines = state.getIn(['vis', 'present', 'pipelines']);
  const first: PipelineRecord = pipelines.first();
  return {
    size: pipelines.size,
    from: first._source
  }
}

function mapDispatch(dispatch: Dispatch, ownProps: OwnProps): DispatchProps {
  return {
    lookup: function(from: number) {
      const field = ownProps.field.name;
      dispatch(addTransform({
        type: 'lookup',
        from: '' + from,
        key: field,
        fields: [field],
        values: [],
        as: []
      }, ownProps.dsId));
    }
  };
}

export class LookupIcon extends React.Component<OwnProps & StateProps & DispatchProps> {

  public render() {
    const props = this.props;
    return (props.size > 1 ? <Icon onClick={() => props.lookup(props.from)}
      glyph={assets.lookup} height='10'
      data-tip='Lookup record on another pipeline' /> : null);
  }

}

export default connect(mapState, mapDispatch)(LookupIcon);
