import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../../store';
import {MarkDraggingStateRecord} from '../../store/factory/Inspector';
import { LyraMarkType, Mark } from '../../store/factory/Mark';
import { GroupRecord } from '../../store/factory/marks/Group';
import {addMark, addGroup } from '../../actions/markActions';
import {removePlaceHolder} from '../../actions/layoutActions';
import {getClosestGroupId} from '../../util/hierarchy';
import { LayoutRecord} from '../../store/factory/Layout';

interface StateProps {
  dragging: MarkDraggingStateRecord;
  sceneId: number;
  layout: LayoutRecord;
}

interface OwnProps {
  layoutId: number;
  placeholderId: number;
  top: number;
  left: number;
  width: number;
  height: number;
}
interface DispatchProps {
  addMark: (type: LyraMarkType, parentId: number) => void;
  addGroup: (sceneId: number) => void;
  removePlaceHolder: () => void;
}

function mapStateToProps(state: State,  ownProps: OwnProps): StateProps {
  const draggingRecord = state.getIn(['inspector', 'dragging']);
  const isMarkDrag = draggingRecord && (draggingRecord as MarkDraggingStateRecord).mark;
  let sceneId;
  state.getIn(['vis', 'present', 'marks']).filter(mark => mark.name == "Scene").forEach(scene => sceneId = scene._id);
  const layout = state.getIn(['vis', 'present', 'layouts', ownProps.layoutId]);

  return {
    dragging: isMarkDrag ? draggingRecord : null,
    sceneId,
    layout,
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
    addGroup: (sceneId) => {
      const newMarkProps = Mark('group', {
        _parent: sceneId,
        encode: {
          update: {
            fill: {'value': 'transparent'},
            stroke: null,
            x: {value: ownProps.left},
            y: {value: ownProps.top},
            x2: {value: 140, _disabled: true},
            y2: {value: 140, _disabled: true},
            xc: {value: 70, _disabled: true},
            yc: {value: 70, _disabled: true},
            // width: {value: scene && scene.get('width')},
            // height: {value: scene && scene.get('height')},
            width: {value: ownProps.width},
            height: {value: ownProps.height}
          }
        }
      });

      dispatch(addGroup(newMarkProps as GroupRecord, ownProps.layoutId, null));
    },
    removePlaceHolder: () => {
      dispatch(removePlaceHolder(ownProps.placeholderId, ownProps.layoutId));
    }

  };
}

class MarkDropPlace extends React.Component<StateProps & DispatchProps & OwnProps> {

  public handleDragOver = (evt) => {
    if (evt.preventDefault) {
      evt.preventDefault();
    }

    return false;
  };

  public handleDrop = ()  => {
    const sceneId = this.props.sceneId;
    this.props.addGroup(sceneId);
    this.props.addMark(this.props.dragging.mark, null);
    this.props.removePlaceHolder();
  };

  public render() {
    if (!(this.props.dragging)) return null;
    return (
      <div style={{top:this.props.top+this.props.height*0.1, left:this.props.left + this.props.width*0.15, width:this.props.width*0.7, height:this.props.height*0.7}} className={"drop-mark placeholder"}  onDragOver={(e) => this.handleDragOver(e)} onDrop={() => this.handleDrop()}>
        <div><i>Add group here</i></div>
      </div>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(MarkDropPlace);
