import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../store';
import ResizeLine from './ResizeLine';
import { LayoutRecord} from '../store/factory/Layout';

interface StateProps {
  layout: LayoutRecord;
  rowSizes: number[];
  colSizes: number[]
}

function mapStateToProps(state: State): StateProps {
  const layout = state.getIn(['vis', 'present', 'layouts', '2']);// get rid of hardcoded value
  // const layout = state.getIn(['vis', 'present', 'layouts', ownProps.layoutId]);

  const rowSizes = layout.rowSizes.map(obj => state.getIn(['vis', 'present', 'signals', obj.signal, 'value']));
  const colSizes = layout.colSizes.map(obj => state.getIn(['vis', 'present', 'signals', obj.signal, 'value']));

  return {
    layout,
    rowSizes,
    colSizes
  };
}

class RowColResizeHandles extends React.Component<StateProps> {
  public render() {
    return (
      <div className={'rowColResize-container'}>
        {[...Array(this.props.layout.rows).keys()].map(i => {
          if (i < this.props.layout.rows -1){
            return(<ResizeLine  key={i} index={i} direction="horizontal" layoutId={this.props.layout._id} dragging={false}/>)
          } else {return null}
        })}
       {[...Array(this.props.layout.cols).keys()].map(i => {
          if (i < this.props.layout.cols -1){
            return(<ResizeLine key={i} index={i} direction="vertical" layoutId={this.props.layout._id} dragging={false}/>)
          } else {return null}
          })}

      </div>
    )}

}

export default connect(mapStateToProps, null)(RowColResizeHandles);