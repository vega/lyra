import * as React from 'react';
import {ColumnRecord} from '../../store/factory/Dataset';
import AggregateField from './AggregateField';
const AGGREGATE_OPS = require('../../constants/aggregateOps');

const SHORT_LIST = 5;

export interface AggregateHandlers {
  onDragStart: (evt: React.DragEvent) => void,
  onDragEnd: (evt: React.DragEvent, obj: any) => void
}

interface OwnProps {
  handlers: AggregateHandlers;
  style: object;
  field: ColumnRecord;
}

interface OwnState {
  fullList: boolean;
}
class TransformsList extends React.Component<OwnProps, OwnState> {

  constructor(props) {
    super(props);

    this.state = {fullList: false};
  }
  public componentWillReceiveProps(newProps: OwnProps) {
    if (newProps.field !== this.props.field) {
      this.setState({fullList: false});
    }
  }

  public expand() {
    this.setState({fullList: true});
  }

  public render() {
    const props = this.props;
    const fullList = this.state.fullList;
    const aggs = AGGREGATE_OPS.slice(0, fullList ? undefined : SHORT_LIST);

    return (
      <div className='aggregates-list' style={props.style}>
        {aggs.map(function(agg, i) {
          return (
            <AggregateField op={agg} key={i} field={props.field} {...props.handlers} />
          );
        })}

        {!fullList ? (
          <div className='more full field derived' onClick={this.expand}>+ More</div>
        ) : null}
      </div>
    );
  }
}

export default TransformsList;
