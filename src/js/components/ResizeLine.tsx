import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../store';
import { LayoutRecord} from '../store/factory/Layout';
import { defaultGroupSpacing} from '../store/factory/marks/Group';
import sg from '../ctrl/signals';
import {throttle} from 'throttle-debounce';

const ctrl = require('../ctrl');

interface StateProps {
  layout: LayoutRecord;
  colSizes: any[];
  rowSizes: any[];
}

interface OwnProps {
  index: number;
  layoutId: number;
  direction: string;
}
interface DispatchProps {
  setSignal: (value: number, dimSignals: any[]) => void;
}

interface OwnState {
  vis: boolean;
  dragging: boolean;
  pos1: number;
  pos2: number;
}

function mapStateToProps(state: State,  ownProps: OwnProps): StateProps {
  const layout = state.getIn(['vis', 'present', 'layouts', String(ownProps.layoutId)]);

  const rowSizes = layout.rowSizes.map(obj => state.getIn(['vis', 'present', 'signals', obj.signal]));
  const colSizes = layout.colSizes.map(obj => state.getIn(['vis', 'present', 'signals', obj.signal]));

  return {
    layout,
    rowSizes,
    colSizes
  };
}

function mapDispatchToProps(dispatch, ownProps: OwnProps): DispatchProps {
  return {
    setSignal: (value, dimSignals) => {
      let signalName = dimSignals[ownProps.index].name;
      // console.log("setting", signalName, value);
      sg.set(signalName, value);
      ctrl.update();
    },
  };
}

class ResizeLine extends React.Component<StateProps & DispatchProps & OwnProps, OwnState> {
  constructor(props) {
    super(props);

    this.state = { vis: false,
      dragging: false,
      pos1: 0,
      pos2: 0
    };
  };

  public handleMouseDown = (e) => {
    console.log("here", this.props.index);

    this.setState({dragging: true, pos1: e.clientX, pos2: e.clientY});

    console.log("mouse down", this.state.pos1);

    window.addEventListener('mousemove', this.handleMouseMove, true);
    window.addEventListener('mouseup', this.handleMouseUp, true);
  }

  public handleMouseUp = (e) => {
    window.removeEventListener('mousemove', this.handleMouseMove, true);
    window.removeEventListener('mouseup', this.handleMouseUp, true);

    this.setState({dragging: false});
    console.log("end drag", this.state.dragging);
  }

  public handleMouseMove = throttle(100, (e)  => {
    if (this.state.dragging && this.props.direction == "horizontal"){
      this.props.setSignal(this.props.rowSizes[this.props.index].value + e.clientY - this.state.pos2, this.props.rowSizes);
      // this.props.setSignal(this.props.rowSizes[this.props.index+1] - (e.clientY - this.state.pos2));
    } else if (this.state.dragging  && this.props.direction == "vertical") {
      this.props.setSignal(this.props.colSizes[this.props.index].value + e.clientX - this.state.pos1, this.props.colSizes);
      // this.props.setSignal(this.props.colSizes[this.props.index+1] - (e.clientX - this.state.pos1));
    }

    this.setState({pos1: e.clientX, pos2: e.clientY});

  });

  public handleMouseOver = () => {
    this.setState({vis: true});
  }

  public handleMouseOut = () => {
    if (!this.state.dragging) {
      this.setState({vis: false});
    }

  }

  public render() {
    let dimSizes;
    let length;
    if (this.props.direction == "horizontal") {
      let cumm = 0;
      dimSizes = this.props.rowSizes.map((signal) => {cumm += signal.value; return cumm});
      length = this.props.colSizes.reduce((acc, signal) => {return acc + signal.value+defaultGroupSpacing}, -defaultGroupSpacing);
    } else if (this.props.direction == "vertical") {
      let cumm = 0;
      dimSizes = this.props.colSizes.map((signal) => {cumm += signal.value; return cumm});
      length = this.props.rowSizes.reduce((acc, signal) => {return acc + signal.value+defaultGroupSpacing}, -defaultGroupSpacing);
    }

    return (
      <div>
      {this.props.direction == "horizontal" ?
      <div style={{top: dimSizes[this.props.index]+ (3/4+this.props.index)*defaultGroupSpacing, width:length, borderTop: this.state.vis? '5px dotted lightgray' : '5px dotted white'}} className={"resize-line " + this.props.direction} onMouseOver={this.handleMouseOver} onMouseOut={ this.handleMouseOut} onMouseDown={(e) => this.handleMouseDown(e)}>
      </div>
      :
      <div style={{left: dimSizes[this.props.index]+ (3/4+this.props.index)*defaultGroupSpacing, height: length, borderLeft: this.state.vis? '5px dotted lightgray' : '5px dotted white'}} className={"resize-line " + this.props.direction} onMouseOver={this.handleMouseOver} onMouseOut={ this.handleMouseOut} onMouseDown={(e) => this.handleMouseDown(e)}>
      </div>
      }
      {/* {this.props.direction == "horizontal" ?
      <div style={{top: dimSizes[this.props.index]+ this.props.index*defaultGroupSpacing+defaultGroupSpacing/2-5, width:length, borderTop: this.state.vis? '10px dashed lightgray' : '10px dashed white'}} className={"resize-line " + this.props.direction} onMouseOver={this.handleMouseOver} onMouseOut={ this.handleMouseOut} onDragStart={ this.handleMouseDown} onDragEnd={this.handleMouseUp} onDrag={this.handleMouseMove}>
      </div>
      :
      <div style={{left: dimSizes[this.props.index]+ this.props.index*defaultGroupSpacing+defaultGroupSpacing/2-5, height: length, borderLeft: this.state.vis? '10px dashed lightgray' : '10px dashed white'}} className={"resize-line " + this.props.direction} onMouseOver={ this.handleMouseOver} onMouseOut={this.handleMouseOut} onDrag={this.handleMouseMove} onDragStart={this.handleMouseDown} onDragEnd={this.handleMouseUp}>
      </div>
      } */}
      </div>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(ResizeLine);
