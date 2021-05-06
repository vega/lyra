import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../store';
import { LayoutRecord} from '../store/factory/Layout';
import { defaultGroupSpacing} from '../store/factory/marks/Group';
import {propSg} from '../util/prop-signal';
import sg from '../ctrl/signals';

interface StateProps {
  layout: LayoutRecord;
  colSizes: number[];
  rowSizes: number[];
}

interface OwnProps {
  index: number;
  layoutId: number;
  direction: string;

  dragging: boolean;
}
interface DispatchProps {
  setSignal: (value: number) => void;
}

function mapStateToProps(state: State,  ownProps: OwnProps): StateProps {
  const layout = state.getIn(['vis', 'present', 'layouts', String(ownProps.layoutId)]);

  const rowSizes = layout.rowSizes.map(obj => state.getIn(['vis', 'present', 'signals', obj.signal, 'value']));
  const colSizes = layout.colSizes.map(obj => state.getIn(['vis', 'present', 'signals', obj.signal, 'value']));

  return {
    layout,
    rowSizes,
    colSizes
  };
}

function mapDispatchToProps(dispatch, ownProps: OwnProps): DispatchProps {
  return {
    setSignal: (value) => {
      let signalName = ownProps.direction == "vertical"? propSg(ownProps.layoutId, "layout", "col_" + ownProps.index+"_size") : propSg(ownProps.layoutId, "layout", "row_" + ownProps.index+"_size");
      sg.set(signalName, value);
    },
  };
}

class ResizeLine extends React.Component<StateProps & DispatchProps & OwnProps> {
  // public componentDidUpdate = function (state) {
  //   if (this.state.dragging && !state.dragging) {
  //     document.addEventListener('mousemove', this.handleMouseMove)
  //     document.addEventListener('mouseup', this.handleMouseUp)
  //   } else if (!this.state.dragging && state.dragging) {
  //     document.removeEventListener('mousemove', this.handleMouseMove)
  //     document.removeEventListener('mouseup', this.handleMouseUp)
  //   }
  // }

  // public handleMouseDown = (e) => {
  //   this.props.dragging = true;
  //   e.preventDefault()
  // }

  // public handleMouseUp = (e) => {
  //   this.props.dragging =  false;
  //   e.preventDefault()
  // }
  public handleMouseMove = (e)  => {
    e.preventDefault();

    if (this.props.direction == "horizontal"){
      this.props.setSignal(this.props.rowSizes[this.props.index]-e.pageY);
    } else {
      this.props.setSignal(this.props.colSizes[this.props.index]-e.pageX);
    }

  };

  public handleClick = (e) => {
    if (this.props.direction == "horizontal"){
      this.props.setSignal(this.props.rowSizes[this.props.index]+10);
    } else {
      this.props.setSignal(this.props.colSizes[this.props.index]+10);
    }
  }

  public handleDblClick = (e) => {
    if (this.props.direction == "horizontal"){
      this.props.setSignal(this.props.rowSizes[this.props.index]-10);
    } else {
      this.props.setSignal(this.props.colSizes[this.props.index]-10);
    }
  }


  public render() {
    let dimSizes;
    let length;
    if (this.props.direction == "horizontal") {
      let cumm = 0;
      dimSizes = this.props.rowSizes.map((size) => {cumm += size; return cumm});
      length = this.props.colSizes.reduce((acc, size) => {return acc + size+defaultGroupSpacing}, -defaultGroupSpacing);
    } else if (this.props.direction == "vertical") {
      let cumm = 0;
      dimSizes = this.props.colSizes.map((size) => {cumm += size; return cumm});
      length = this.props.rowSizes.reduce((acc, size) => {return acc + size+defaultGroupSpacing}, -defaultGroupSpacing);
    }

    let vis = false;

    return (
      <div>
      {/* {this.props.direction == "horizontal" ?
      <div draggable style={{top: dimSizes[this.props.index]+defaultGroupSpacing/2, width:length}} className={"resize-line " + this.props.direction} onMouseDown={(e) => this.handleMouseDown(e)} onMouseUp={(e) => this.handleMouseUp(e)} onMouseMove={(e) => this.handleMouseMove(e)}>
      </div>
      :
      <div draggable style={{left: dimSizes[this.props.index]+defaultGroupSpacing/2, height: length}} className={"resize-line " + this.props.direction} onMouseDown={(e) => this.handleMouseDown(e)} onMouseUp={(e) => this.handleMouseUp(e)} onMouseMove={(e) => this.handleMouseMove(e)}>
      </div>
      } */}
      {this.props.direction == "horizontal" ?
      <div draggable style={{top: dimSizes[this.props.index]+defaultGroupSpacing/2, width:length, borderTop: vis? '5px solid black' : '5px dashed lightgray'}} className={"resize-line " + this.props.direction} onClick={(e) => this.handleClick(e)} onDoubleClick={(e) => this.handleDblClick(e)}>
      </div>
      :
      <div draggable style={{left: dimSizes[this.props.index]+defaultGroupSpacing/2, height: length, borderLeft: vis? '5px solid black' : '5px dashed lightgray'}} className={"resize-line " + this.props.direction} onClick={(e) => this.handleClick(e)} onDoubleClick={(e) => this.handleDblClick(e)}>
      </div>
      }
      </div>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(ResizeLine);
