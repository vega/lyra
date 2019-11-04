import * as React from 'react';
import {ColumnRecord} from '../../store/factory/Dataset';
import {AggregateHandlers} from './AggregateList';

const AGGREGATE_OPS = require('../../constants/aggregateOps');

interface OwnProps extends AggregateHandlers {
  op: any; // propTypes.oneOf(AGGREGATE_OPS).isRequired,
  field: ColumnRecord
}

class AggregateField extends React.Component<OwnProps> {

  public onDragEnd = (evt) => {
    const props = this.props;
    props.onDragEnd(evt, {aggregate: props.op});
  }

  public render() {
    const props = this.props;
    const field = props.field;
    const fieldName = field ? field.name : null;

    return (
      <div className={'full field derived aggregate-field'} draggable={true}
        onDragStart={props.onDragStart}
        onDragEnd={this.onDragEnd}>
        <strong>{props.op}</strong>_{fieldName}
      </div>
    );
  }
}

export default AggregateField;
