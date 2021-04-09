import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../../store';
import {MarkDraggingStateRecord} from '../../store/factory/Inspector';
import { LyraMarkType, Mark } from '../../store/factory/Mark';
import {addMark, addGroup } from '../../actions/markActions';
import {getClosestGroupId} from '../../util/hierarchy';
import { LayoutRecord, Placeholder} from '../../store/factory/Layout';
import {addPlaceHoldertoLayout} from '../../actions/layoutActions';
import {GroupRecord, defaultGroupHeight, defaultGroupWidth, defaultGroupSpacing} from '../../store/factory/marks/Group';

interface StateProps {
  dragging: MarkDraggingStateRecord;
  sceneId: number;
  layout: LayoutRecord;
  colSizes: number[];
  rowSizes: number[];
}

interface OwnProps {
  index: number
  layoutId: number;
  direction: string;
}
interface DispatchProps {
  addMark: (type: LyraMarkType, parentId: number) => void;
  addGroup: (sceneId: number, x: number, y: number) => void;
  addPlaceHoldertoLayout: (top: number, left: number, width: number, height: number) => void;
}

function mapStateToProps(state: State,  ownProps: OwnProps): StateProps {
  const draggingRecord = state.getIn(['inspector', 'dragging']);
  const isMarkDrag = draggingRecord && (draggingRecord as MarkDraggingStateRecord).mark;
  const sceneId = state.getIn(['vis', 'present', 'scene', '_id']);
  const layout = state.getIn(['vis', 'present', 'layouts', ownProps.layoutId]);

  const rowSizes = layout.rowSizes.map(obj => state.getIn(['vis', 'present', 'signals', obj.signal, 'value']));
  const colSizes = layout.colSizes.map(obj => state.getIn(['vis', 'present', 'signals', obj.signal, 'value']));

  return {
    dragging: isMarkDrag ? draggingRecord : null,
    sceneId,
    layout,
    rowSizes,
    colSizes
  };
}

function mapDispatchToProps(dispatch, ownProps: OwnProps): DispatchProps {
  return {
    addMark: (type, parentId) => {
;      if (!parentId) {
        parentId = getClosestGroupId();
      }

      if (parentId === 1 && type !== 'group') {
        // parent is scene. don't add marks directly to the scene (marks should be under a group)
        return;
      }
      const newMarkProps = Mark(type, {
        _parent: parentId
      });
      dispatch(addMark(newMarkProps));
    },
    addGroup: (sceneId, x, y) => {

      const newMarkProps = Mark('group', {
        _parent: sceneId,
        encode: {
          update: {
            fill: {'value': 'transparent'},
            stroke: null,
            x: {value: x},
            y: {value: y},
            x2: {value: 140, _disabled: true},
            y2: {value: 140, _disabled: true},
            xc: {value: 70, _disabled: true},
            yc: {value: 70, _disabled: true},
            // width: {value: scene && scene.get('width')},
            // height: {value: scene && scene.get('height')},
            width: {value: defaultGroupWidth},
            height: {value: defaultGroupHeight}
          }
        }
      });

      dispatch(addGroup(newMarkProps as GroupRecord, ownProps.layoutId, ownProps.direction));
    },
    addPlaceHoldertoLayout: (top, left, width, height) => {
      const holder = Placeholder({top, left, width, height});
      dispatch(addPlaceHoldertoLayout(holder, ownProps.layoutId))
    }
  };
}

class MarkDropzone extends React.Component<StateProps & DispatchProps & OwnProps> {

  public handleDragOver = (evt) => {
    if (evt.preventDefault) {
      evt.preventDefault();
    }

    return false;
  };

  public handleDrop = ()  => {
    const sceneId = this.props.sceneId;
    let numDims = (this.props.direction == "top" || this.props.direction == "bottom")?  this.props.colSizes.length:  this.props.rowSizes.length;
    let x;
    let y;
    if (this.props.direction == "top" || this.props.direction == "bottom") {
      x = this.props.colSizes.reduce((acc, size, i)=>{if (i< this.props.index) {return acc +size+defaultGroupSpacing} else {return acc}}, 0);
      y = this.props.direction == "top"? 0 : this.props.rowSizes.reduce((size, acc)=>{return acc +size+defaultGroupSpacing}, 0);
    } else if (this.props.direction == "left" || this.props.direction == "right") {
      x = this.props.direction == "left"? 0 : this.props.colSizes.reduce((size, acc)=>{return acc +size+defaultGroupSpacing}, 0);
      y = this.props.rowSizes.reduce((acc, size, i)=>{if (i< this.props.index) {return acc +size+defaultGroupSpacing} else {return acc}}, 0);
    }

    this.props.addGroup(sceneId, x, y);
    this.props.addMark(this.props.dragging.mark, null);

    for (let i=0; i< numDims; i++) {
      if (i != this.props.index) {
        let top;
        let left;
        let width;
        let height;
        if (this.props.direction == "top" || this.props.direction == "bottom") {
          top = this.props.direction == "top" ? 0 : this.props.rowSizes.reduce((acc, size)=> acc+size+defaultGroupSpacing, 0);
          left = this.props.colSizes.reduce((acc, size, j)=>{if (j< i) {return acc +size+defaultGroupSpacing} else {return acc}}, 0);
          width = this.props.colSizes[i];
          height = defaultGroupHeight;
        } else if (this.props.direction == "right" || this.props.direction == "left") {
          left = this.props.direction == "left" ? 0 : this.props.colSizes.reduce((acc, size)=> acc+size+defaultGroupSpacing, 0);
          top = this.props.rowSizes.reduce((acc, size, j)=>{if (j< i) {return acc +size+defaultGroupSpacing} else {return acc}}, 0);;
          width = defaultGroupWidth;
          height = this.props.rowSizes[i];
        }
        this.props.addPlaceHoldertoLayout(top, left, width, height);
      }
    }

  };

  public render() {
    if (!(this.props.dragging)) return null;
    let dimSizes;
    if (this.props.direction == "top" || this.props.direction == "bottom") {
      dimSizes = this.props.colSizes;
    } else if (this.props.direction == "right" || this.props.direction == "left") {
      dimSizes = this.props.rowSizes;
    }

    return (
      <div style={{width: dimSizes[this.props.index]}} className={"drop-mark " + this.props.direction}  onDragOver={(e) => this.handleDragOver(e)} onDrop={() => this.handleDrop()}>
        <div><i>Add group to {this.props.direction}</i></div>
      </div>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(MarkDropzone);
