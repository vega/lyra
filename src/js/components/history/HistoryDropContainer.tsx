import * as React from 'react';
import { connect } from 'react-redux';
import {State, VisStateTree} from '../../store';
import {HistoryDraggingState} from '../../store/factory/Inspector';
import { LyraMarkType, Mark } from '../../store/factory/Mark';
import {addMark} from '../../actions/markActions';
import {getClosestGroupId} from '../../util/hierarchy';
import HistoryDropZone from './HistoryDropZone';
const imutils = require('../../util/immutable-utils');
const getInVis = imutils.getInVis;
import exportName from '../../util/exportName';
interface StateProps {
  dragging: HistoryDraggingState;
  currentState: VisStateTree;
  isHistoryDrag: boolean;
}

interface DispatchProps {
  addMark: (type: LyraMarkType, parentId: number) => void;
}

function mapStateToProps(state: State): StateProps {
  const draggingRecord = state.getIn(['inspector', 'dragging']);
  const isHistoryDrag = (draggingRecord as HistoryDraggingState) && draggingRecord != null;
  return {
    dragging: isHistoryDrag ? draggingRecord : null,
    currentState: state.getIn(["vis", "present"]),
    isHistoryDrag
  };
}

function mapDispatchToProps(dispatch, ownProps): DispatchProps {
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
    }
  };
}

class HistoryDropContainer extends React.Component<StateProps & DispatchProps> {

  private getDropZoneDims () {
    let zones =[];
    if (this.props.isHistoryDrag) {
      let state = this.props.currentState;
      let markId = "lyra_"+this.props.dragging.lyraId;

      if(!ctrl.view) {
        return zones;
      }

      let scenegraphRoot = ctrl.view.scenegraph().root;
      let scenegraphElements = scenegraphRoot.items[0].items[0].items[0].items;
      let xOffset = scenegraphRoot.bounds.x1 - 10;
      let yOffset = scenegraphRoot.bounds.y1;

      scenegraphElements.forEach((ele) => {
        if (ele.role === "axis") {
          let axis = ele.items[0];
          let data = axis.datum;
          let bounds = axis.bounds;
          zones.push({
            type: (data.orient === "left" || data.orient === "right") ? "y" : "x",
            x: bounds.x1 - xOffset,
            y: bounds.y1 - yOffset,
            width: bounds.x2 - bounds.x1,
            height: bounds.y2 - bounds.y1
          });
        } else if (ele.role === "legend") {
          let legend = ele.items[0];
          let bounds = legend.bounds;
          zones.push({
            type: "legend",
            x: bounds.x1 - xOffset,
            y: bounds.y1 - yOffset,
            width: bounds.x2 - bounds.x1,
            height: bounds.y2 - bounds.y1
          });
        } else if (ele.role === markId) {
          let bounds = ele.bounds;
          zones.push({
            type: "mark",
            x: bounds.x1 - xOffset,
            y: bounds.y1 - yOffset,
            width: bounds.x2 - bounds.x1,
            height: bounds.y2 - bounds.y1
          });
        }
      });
    }

    return zones;
  }
  public render() {
    if (!(this.props.dragging?.historyId)) return null;
    let zones = this.getDropZoneDims();

    return (
        <div id='history-drop-container' >
          {zones.map(
            (item, idx) => {
              return <HistoryDropZone key={idx} x={item.x} y={item.y} width={item.width} height={item.height} type={item.type }/>
            }
          )}
        </div>

    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(HistoryDropContainer);