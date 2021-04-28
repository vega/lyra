import * as React from 'react';
import { connect } from 'react-redux';
import {State, VisStateTree} from '../../store';
import {HistoryDraggingState} from '../../store/factory/Inspector';
const imutils = require('../../util/immutable-utils');
const getInVis = imutils.getInVis;
import sg from '../../ctrl/signals';
import {MODE, SELECTED, CELL} from '../../store/factory/Signal';
const ctrl = require('../../ctrl');
import {updateGuideProperty} from '../../actions/guideActions';
import * as vega from 'vega';
import bindChannel from '../../actions/bindChannel';
import {ColumnRecord} from '../../store/factory/Dataset';
import {ThunkDispatch} from 'redux-thunk';
import { AnyAction } from 'redux';

interface OwnProps {
  type: string,
  x: number;
  y: number;
  width: number;
  height: number;
}

interface StateProps {
  dragging: HistoryDraggingState;
  sceneId: number;
  currentState: VisStateTree;
}

interface DispatchProps {
  updateGuideProperty: (guideId: number, property: string, value: any) => void;

  bindChannel: (dsId: number, field: ColumnRecord, markId: number, property: string) => void;
}

function mapStateToProps(state: State): StateProps {
  const draggingRecord = state.getIn(['inspector', 'dragging']);
  const isHistoryDrag = draggingRecord && (draggingRecord as HistoryDraggingState);
  const sceneId = getInVis(state, 'scene._id');

  return {
    dragging: isHistoryDrag ? draggingRecord : null,
    sceneId: sceneId,
    currentState: state.getIn(["vis", "present"]),
  };
}

function mapDispatchToProps(dispatch: ThunkDispatch<State, null, AnyAction>, ownProps): DispatchProps {
  return {
    updateGuideProperty: function(guideId, property, value) {
      dispatch(updateGuideProperty({property, value}, guideId));
    },
    bindChannel: function(dsId: number, field, markId: number, property: string) {
      dispatch(bindChannel(dsId, field, markId, property));
    }
  };
}

class HistoryDropZone extends React.Component<OwnProps & StateProps & DispatchProps> {

  public handleDragOver = (evt) => {
    if (evt.preventDefault) {
      evt.preventDefault();
    }

    return false;
  };

  private updateScales = (type, key?) => {
    const lyraId = this.props.dragging.lyraId; // id of thing that was dropped onto
    let fieldName, dsId;
    let typeScaleIds = this.props.dragging.history.getIn(["guides"])
      .map((g) => {
        return type == 'x' || type == 'y' ? g.scale : type == 'size' ? g[type] : g.fill;
      })
      .filter((scaleId) => {
        let scaleName = scaleId ? this.props.dragging.history.getIn(["scales"]).get(scaleId).name : null;
        return scaleName ? scaleName.includes(type) : false;
      });

    fieldName = typeScaleIds.map((scaleId) => {
      let scaleRecord = this.props.dragging.history.getIn(["scales"]).get(scaleId);
      return scaleRecord.get('_domain').length > 0 ?  scaleRecord.get('_domain')[0].field : null;
    }).first();

    dsId = typeScaleIds.map((scaleId) => {
      let scaleRecord = this.props.dragging.history.getIn(["scales"]).get(scaleId);
      return scaleRecord.get('_domain').length > 0 ?  scaleRecord.get('_domain')[0].data : null;
    }).first();

    if (fieldName != null && dsId != null) {
      const bindField = this.props.dragging.history.getIn(["datasets", String(dsId), "_schema", fieldName]).toJS();
      vega.extend(bindField);
      this.props.bindChannel(dsId, bindField, lyraId, key || type);
    }
  };

  public handleDrop = ()  => {
    let type = this.props.type;
    if (type == "mark") {
      let relevantProps = ["size", "shape", "fill", "fillOpacity", "stroke",  "strokeWidth"];
      let historyMark = this.props.dragging.history.getIn(["marks", String(this.props.dragging.lyraId)]); // assume mark is the same as before. wanna revert to old settings of old mark

      relevantProps.forEach((prop) => {
        let historyProp = historyMark.getIn(["encode", "update", prop]);
        if (historyProp.signal) {
          let historySigVal = this.props.dragging.history.getIn(["signals", historyProp.signal]).value;
          sg.set(historyProp.signal, historySigVal, false);
        }
      });
      this.updateScales("size");
      this.updateScales("color", "fill");
    } else if (type == "x" || type == "y") {
      this.updateScales(type);
      let relevantProps= [
        ["title"], ["orient"],
        ["encode", "domain", "update", "stroke", "value"],
        ["encode", "domain", "update", "strokeWidth", "value"],
        ["encode", "title", "update", "fontSize", "value"],
        ["encode", "title", "update", "fill", "value"],
        ["encode", "labels", "update", "fontSize", "value"],
        ["encode", "labels", "update", "angle", "value"]
      ];
      let checkAxisType = (orient) => {
        return type == "x" ? (orient == "bottom" || orient == "top") : (orient == "left" || orient == "right");
      };
      let updatedAxis = store.getState().getIn(["vis", "present"]).getIn(["guides"]) // TODO(ej): might need to not use store directly
        .filter((g) => {
          return g._gtype == "axis" && checkAxisType(g.orient);
        }).first();
      relevantProps.forEach((prop) => {
        let historyVal = updatedAxis.getIn(prop);
        this.props.updateGuideProperty(updatedAxis._id, prop.join("."), historyVal );

      });

    } else if (type == "legend") {
      let relevantProps= [
        ["title"], ["orient"],
        ["encode", "symbols", "update", "stroke", "value"],
        ["encode", "symbols", "update", "size", "value"],
        ["encode", "symbols", "update", "shape", "value"],
        ["encode", "title", "update", "fontSize", "value"],
        ["encode", "title", "update", "fill", "value"],
        ["encode", "labels", "update", "fontSize", "value"],
        ["encode", "labels", "update", "angle", "value"]
      ];
      let historyAxis = this.props.dragging.history.getIn(["guides"])
        .filter((g) => {
          return g._gtype == "legend";
        }).first();
      relevantProps.forEach((prop) => {
        let historyVal = historyAxis.getIn(prop);
        // this.props.updateGuideProperty(historyAxis._id, prop.join("."), historyVal );
      });
    }

    ctrl.update(); // Apply changes
  };

  public render() {
    return (
      <div className={"drop-history "+this.props.type+'-drop'} style={{left: this.props.x+'px', top: this.props.y+'px', width: this.props.width+'px', height: this.props.height+'px'}} onDragOver={(e) => this.handleDragOver(e)} onDrop={() => this.handleDrop()}>
      </div>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(HistoryDropZone);