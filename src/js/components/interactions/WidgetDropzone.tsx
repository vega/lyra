import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../../store';
import {ScaleInfo} from '../../store/factory/Interaction';
import {FieldDraggingStateRecord} from '../../store/factory/Inspector';
import {addWidget} from '../../actions/widgetActions';
import {getScaleInfoForGroup} from '../../ctrl/demonstrations';
import {getClosestGroupId} from '../../util/hierarchy';
import {Widget} from '../../store/factory/Widget';
const ctrl = require('../../ctrl');
interface StateProps {
  dragging: FieldDraggingStateRecord;
  groupId: number;
  canDemonstrate: boolean;
}

interface DispatchProps {
  addWidget: (payload) => void;
}

function mapStateToProps(state: State): StateProps {
  const groupId = getClosestGroupId();
  const scaleInfo: ScaleInfo = getScaleInfoForGroup(state, groupId);
  const isParsing = state.getIn(['vega', 'isParsing']);

  const canDemonstrate = Boolean(!isParsing && ctrl.view && (scaleInfo.xScaleName && scaleInfo.xFieldName || scaleInfo.yScaleName && scaleInfo.yFieldName));

  return {
    dragging: state.getIn(['inspector', 'dragging']),
    groupId,
    canDemonstrate
  };
}

const actionCreators = {addWidget};

class WidgetDropzone extends React.Component<StateProps & DispatchProps> {

  public handleDragOver = (evt) => {
    if (evt.preventDefault) {
      evt.preventDefault();
    }

    return false;
  };

  public handleDrop = ()  => {
    this.props.addWidget(Widget({
      groupId: this.props.groupId,
      field: this.props.dragging.fieldDef,
      dsId: this.props.dragging.dsId,
    }));
  };

  public render() {
    if (!(this.props.dragging && this.props.canDemonstrate)) return null;
    return (
      <div className="interaction-widget" onDragOver={(e) => this.handleDragOver(e)} onDrop={() => this.handleDrop()}>
        <div><i>Drop field to add query widget</i></div>
      </div>
    );
  }

}

export default connect(mapStateToProps, actionCreators)(WidgetDropzone);
