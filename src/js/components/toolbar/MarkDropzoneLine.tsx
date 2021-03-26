import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../../store';
import MarkDropzone from './MarkDropzone';
import { LayoutRecord} from '../../store/factory/Layout';

interface OwnProps {
  direction: string;
  layoutId: number
}

interface StateProps {
  layout: LayoutRecord
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  const layout = state.getIn(['vis', 'present', 'layouts', ownProps.layoutId]);
  return {
    layout
  };
}

class MarkDropzoneGroup extends React.Component<StateProps & OwnProps> {
  public render() {
    return (
      <div className={'markdropzone-line ' + this.props.direction}>
        {this.props.direction == 'right' || this.props.direction == 'left'
         ? [...Array(this.props.layout.rows).keys()].map(i => {
            return(<MarkDropzone key={i} direction={this.props.direction} layoutId={this.props.layoutId}/>)
        })
      : [...Array(this.props.layout.cols).keys()].map(i => {
        return(<MarkDropzone key={i} direction={this.props.direction} layoutId={this.props.layoutId}/>)
    })}

      </div>
    )}

}

export default connect(mapStateToProps, null)(MarkDropzoneGroup);