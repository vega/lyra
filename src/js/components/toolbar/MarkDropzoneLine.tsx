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
  layout: LayoutRecord;
  rowSizes: number[];
  colSizes: number[]
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  const layout = state.getIn(['vis', 'present', 'layouts', ownProps.layoutId]);

  const rowSizes = layout.rowSizes.map(obj => state.getIn(['vis', 'present', 'signals', obj.signal, 'value']));
  const colSizes = layout.colSizes.map(obj => state.getIn(['vis', 'present', 'signals', obj.signal, 'value']));

  return {
    layout,
    rowSizes,
    colSizes
  };
}

class MarkDropzoneGroup extends React.Component<StateProps & OwnProps> {
  public render() {
    let top;
    let left;
    if (this.props.direction == "top" || this.props.direction == "bottom") {
      top = this.props.direction == "top" ? -30: this.props.rowSizes.reduce((acc, size) => acc+size +30, -30) + "px";
      left = 0;
    } else if (this.props.direction == "right" || this.props.direction == "left") {
      top = 0;
      left =  this.props.direction == "left" ? -30: this.props.colSizes.reduce((acc, size) => acc+size +30, -30)+ "px";
    }
    const styles = {top, left};
    return (
      <div style={styles} className={'markdropzone-line ' + this.props.direction}>
        {this.props.direction == 'right' || this.props.direction == 'left'
         ? [...Array(this.props.layout.rows).keys()].map(i => {
            return(<MarkDropzone  key={i} index={i} direction={this.props.direction} layoutId={this.props.layoutId}/>)
        })
      : [...Array(this.props.layout.cols).keys()].map(i => {
        return(<MarkDropzone key={i} index={i} direction={this.props.direction} layoutId={this.props.layoutId}/>)
    })}

      </div>
    )}

}

export default connect(mapStateToProps, null)(MarkDropzoneGroup);