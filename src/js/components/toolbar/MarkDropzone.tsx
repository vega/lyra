import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../../store';
import {MarkDraggingStateRecord} from '../../store/factory/Inspector';
import { LyraMarkType, Mark } from '../../store/factory/Mark';
import {addMark} from '../../actions/markActions';
import {getClosestGroupId} from '../../util/hierarchy';
const imutils = require('../../util/immutable-utils');
const getInVis = imutils.getInVis;
interface StateProps {
  dragging: MarkDraggingStateRecord;
  sceneId: number;
}

interface DispatchProps {
  addMark: (type: LyraMarkType, parentId: number) => void;
}

function mapStateToProps(state: State): StateProps {
  const draggingRecord = state.getIn(['inspector', 'dragging']);
  const isMarkDrag = draggingRecord && (draggingRecord as MarkDraggingStateRecord).mark;
  const sceneId = getInVis(state, 'scene._id');

  return {
    dragging: isMarkDrag ? draggingRecord : null,
    sceneId: sceneId
  };
}

function mapDispatchToProps(dispatch, ownProps): DispatchProps {
  return {
    addMark: (type, parentId) => {
      console.log("parentId", parentId);
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
      console.log("type " + type + " new mark props " + newMarkProps);
      dispatch(addMark(newMarkProps));
    }
  };
}

class MarkDropzone extends React.Component<StateProps & DispatchProps> {

  public handleDragOver = (evt) => {
    if (evt.preventDefault) {
      evt.preventDefault();
    }

    return false;
  };

  public handleDrop = (evt)  => {
    console.log("mark", this.props.dragging.mark);
    // this.props.addMark.bind(null, markType);
    const sceneId = this.props.sceneId;
    console.log("add group")
    this.props.addMark('group', sceneId);
    console.log("add mark");
    this.props.addMark(this.props.dragging.mark, null);
  };

  public render() {
    if (!(this.props.dragging)) return null;
    return (
      <div className="drop-mark" onDragOver={(e) => this.handleDragOver(e)} onDrop={(e) => this.handleDrop(e)}>
        <div><i>Drop mark to create new group</i></div>
      </div>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(MarkDropzone);
