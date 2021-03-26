import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../../store';
import {MarkDraggingStateRecord} from '../../store/factory/Inspector';
import {GroupRecord} from '../../store/factory/marks/Group';
import { LyraMarkType, Mark } from '../../store/factory/Mark';
import {addMark, addGroup } from '../../actions/markActions';
import {addGrouptoLayout} from '../../actions/layoutActions';
import {getClosestGroupId} from '../../util/hierarchy';
const imutils = require('../../util/immutable-utils');
const getInVis = imutils.getInVis;
interface StateProps {
  dragging: MarkDraggingStateRecord;
  sceneId: number;
  groups: GroupRecord[];
}

interface OwnProps {
  key: number
  layoutId: number;
  direction: string;
}
interface DispatchProps {
  addMark: (type: LyraMarkType, parentId: number) => void;
  addGroup: (sceneId: number) => void;
  addGrouptoLayout: (groupId: number) => void;
}

function mapStateToProps(state: State): StateProps {
  const draggingRecord = state.getIn(['inspector', 'dragging']);
  const isMarkDrag = draggingRecord && (draggingRecord as MarkDraggingStateRecord).mark;
  const sceneId = getInVis(state, 'scene._id');
  const groups = state.getIn(['vis', 'present', 'marks']).filter(mark => mark.type == 'group');

  return {
    dragging: isMarkDrag ? draggingRecord : null,
    sceneId: sceneId,
    groups
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
        _parent: sceneId
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
    this.props.addGroup(sceneId);
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
