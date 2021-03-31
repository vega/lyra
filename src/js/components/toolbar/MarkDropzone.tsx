import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../../store';
import {MarkDraggingStateRecord} from '../../store/factory/Inspector';
import {GroupRecord} from '../../store/factory/marks/Group';
import { LyraMarkType, Mark } from '../../store/factory/Mark';
import {addMark, addGroup } from '../../actions/markActions';
import {addGrouptoLayout} from '../../actions/layoutActions';
import {getClosestGroupId} from '../../util/hierarchy';
import { LayoutRecord} from '../../store/factory/Layout';

const imutils = require('../../util/immutable-utils');
const getInVis = imutils.getInVis;
interface StateProps {
  dragging: MarkDraggingStateRecord;
  sceneId: number;
  groups: GroupRecord[];
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
  addGroup: (sceneId: number, rowSizes: number[], colSizes: number[]) => void;
  addGrouptoLayout: (groupId: number) => void;
}

function mapStateToProps(state: State,  ownProps: OwnProps): StateProps {
  const draggingRecord = state.getIn(['inspector', 'dragging']);
  const isMarkDrag = draggingRecord && (draggingRecord as MarkDraggingStateRecord).mark;
  const sceneId = getInVis(state, 'scene._id');
  const groups = state.getIn(['vis', 'present', 'marks']).filter(mark => mark.type == 'group');
  const layout = state.getIn(['vis', 'present', 'layouts', ownProps.layoutId]);

  const rowSizes = layout.rowSizes.map(obj => state.getIn(['vis', 'present', 'signals', obj.signal, 'value']));
  const colSizes = layout.colSizes.map(obj => state.getIn(['vis', 'present', 'signals', obj.signal, 'value']));

  return {
    dragging: isMarkDrag ? draggingRecord : null,
    sceneId: sceneId,
    groups,
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
    addGroup: (sceneId, rowSizes, colSizes) => {
      console.log("index", ownProps.index);
      let x;
      let y;
      // console.log("calc x", rowSizes.reduce((size, acc, i)=>{if (i< ownProps.index) {return acc +size+30} else {return acc}}, 0))
      if (ownProps.direction == "top" || ownProps.direction == "bottom") {
        x = colSizes.reduce((acc, size, i)=>{if (i< ownProps.index) {return acc +size+30} else {return acc}}, 0);
        y = ownProps.direction == "top"? 0 : rowSizes.reduce((size, acc)=>{return acc +size+30}, 0);
      } else if (ownProps.direction == "left" || ownProps.direction == "right") {
        x = ownProps.direction == "left"? 0 : colSizes.reduce((size, acc)=>{return acc +size+30}, 0);
        y = rowSizes.reduce((acc, size, i)=>{if (i< ownProps.index) {return acc +size+30} else {return acc}}, 0);
      }
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
            width: {value: 200},
            height: {value: 150}
          }
        }
      });

      dispatch(addGroup(newMarkProps, ownProps.layoutId, ownProps.direction));
    },
    addGrouptoLayout: (groupId: number) => {dispatch(addGrouptoLayout({groupId, dir: ownProps.direction}, ownProps.layoutId));}
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
    this.props.addGroup(sceneId, this.props.rowSizes, this.props.colSizes);
    this.props.addMark(this.props.dragging.mark, null);
  };

  public render() {
    if (!(this.props.dragging)) return null;
    return (
      <div className={"drop-mark " + this.props.direction}  onDragOver={(e) => this.handleDragOver(e)} onDrop={() => this.handleDrop()}>
        <div><i>Add group to {this.props.direction}</i></div>
      </div>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(MarkDropzone);
