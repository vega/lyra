import * as React from 'react';
import {Map} from 'immutable';
import { connect } from 'react-redux';
import {State} from '../../store';
import {getScaleInfoForGroup} from '../../ctrl/demonstrations';
import {Interaction, ApplicationRecord, ScaleInfo, SelectionRecord, InteractionRecord} from '../../store/factory/Interaction';
import {Dispatch} from 'redux';
import {addInteraction, setSelection, setApplication} from '../../actions/interactionActions';
import {GroupRecord} from '../../store/factory/marks/Group';
import {addInteractionToGroup} from '../../actions/bindChannel/helperActions';
import {MarkRecord} from '../../store/factory/Mark';
import {selectInteraction, InspectorSelectedType} from '../../actions/inspectorActions';
import {EncodingStateRecord} from '../../store/factory/Inspector';

const ctrl = require('../../ctrl');
const listeners = require('../../ctrl/listeners');

interface OwnProps {
  groupId: number;
  groupName: string;
  setActiveGroup: () => void;
}

interface StateProps {
  canDemonstrate: Boolean;
  interaction: InteractionRecord;
}

interface DispatchProps {
  addInteraction: (groupId: number) => number; // return newly created interaction
  selectInteraction: (id: number) => void;
}

interface OwnState {
  isDemonstrating: boolean
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  const scaleInfo: ScaleInfo = getScaleInfoForGroup(state, ownProps.groupId);

  const isParsing = state.getIn(['vega', 'isParsing']);

  const canDemonstrate = Boolean(!isParsing && ctrl.view && (scaleInfo.xScaleName && scaleInfo.xFieldName || scaleInfo.yScaleName && scaleInfo.yFieldName));

  const group: GroupRecord = state.getIn(['vis', 'present', 'marks', String(ownProps.groupId)]);

  const encState: EncodingStateRecord = state.getIn(['inspector', 'encodings']);
  const selId   = encState.get('selectedId');
  const selType = encState.get('selectedType');
  const isSelectedInteraction = selType === InspectorSelectedType.SELECT_INTERACTION;

  let interactionId = null;
  if (isSelectedInteraction) {
    interactionId = group.get('_interactions').find(id => {
      // const record: InteractionRecord = state.getIn(['vis', 'present', 'interactions', String(id)]);
      // if (record.selectionDef && record.selectionDef.label === 'Widget') return false;
      return id === selId;
    });
  }
  if (!interactionId) {
    interactionId = group.get('_interactions').find(id => {
      const record: InteractionRecord = state.getIn(['vis', 'present', 'interactions', String(id)]);
      return !Boolean(record.selection && record.application);
    });
  }
  const interaction = interactionId ? state.getIn(['vis', 'present', 'interactions', String(interactionId)]) : null;

  return {
    canDemonstrate,
    interaction
  };
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    addInteraction: (groupId) => {
      const record = Interaction({
        groupId
      });
      const addAction = addInteraction(record);
      dispatch(addAction);
      dispatch(addInteractionToGroup(addAction.meta, groupId));
      return addAction.meta;
    },
    selectInteraction: (id: number) => {
      dispatch(selectInteraction(id));
    }
  };
}

class InteractionPreviewController extends React.Component<OwnProps & StateProps & DispatchProps, OwnState> {

  constructor(props) {
    super(props);

    this.state = {
      isDemonstrating: false,
    };
  }

  public componentDidUpdate(prevProps: StateProps, prevState: OwnState) {
    if (!prevProps.canDemonstrate && this.props.canDemonstrate) {
      this.restoreSignalValues(this.props.groupName);
      this.onSignal(this.props.groupName, 'grid_translate_anchor', (name, value) => this.onMainViewGridSignal(name, value));
      this.onSignal(this.props.groupName, 'grid_translate_delta', (name, value) => this.onMainViewGridSignal(name, value));
      this.onSignal(this.props.groupName, 'brush_x', (name, value) => this.onMainViewIntervalSignal(name, value));
      this.onSignal(this.props.groupName, 'brush_y', (name, value) => this.onMainViewIntervalSignal(name, value));
      this.onSignal(this.props.groupName, 'points_tuple', (name, value) => this.onMainViewPointSignal(name, value));
      this.onSignal(this.props.groupName, 'points_toggle', (name, value) => this.onMainViewPointSignal(name, value));
    }

    if (this.props.canDemonstrate && this.state.isDemonstrating && prevState.isDemonstrating !== this.state.isDemonstrating) {
      if (!this.props.interaction) {
        const interactionId = this.props.addInteraction(this.props.groupId);
        this.props.selectInteraction(interactionId);
      }
    }
  }

  private mainViewSignalValues = {}; // name -> value
  private updateIsDemonstrating() {
    const intervalActive = (this.mainViewSignalValues['brush_x'] &&
      this.mainViewSignalValues['brush_y'] &&
      this.mainViewSignalValues['brush_x'][0] !== this.mainViewSignalValues['brush_x'][1] &&
      this.mainViewSignalValues['brush_y'][0] !== this.mainViewSignalValues['brush_y'][1]);
    const pointActive = Boolean(this.mainViewSignalValues['points_tuple']);

    const isDemonstrating = intervalActive || pointActive;

    if (!isDemonstrating) {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.setState({
          isDemonstrating
        });
      }, 250);
    }
    else {
      clearTimeout(this.timeout);
      this.timeout = null;
      this.setState({
        isDemonstrating
      }, this.props.setActiveGroup);
    }
  }

  private timeout;

  private onMainViewPointSignal(name, value) {
    if (this.mainViewSignalValues[name] !== value) {
      this.mainViewSignalValues[name] = value;
      this.updateIsDemonstrating();
    }
  }

  private onMainViewIntervalSignal(name, value) {
    if (this.mainViewSignalValues[name] !== value) {
      this.mainViewSignalValues[name] = value;
      this.updateIsDemonstrating();
    }
  }

  private onMainViewGridSignal(name, value) {
    this.mainViewSignalValues[name] = value;
  }

  private restoreSignalValues(groupName) {
    for (let signalName of ['brush_x', 'brush_y', 'points_tuple', 'points_toggle']) {
      if (this.mainViewSignalValues[signalName]) {
        listeners.setSignalInGroup(ctrl.view, groupName, signalName, this.mainViewSignalValues[signalName]);
      }
    }
  }

  private onSignal(groupName, signalName, handler) {
    listeners.onSignalInGroup(ctrl.view, groupName, signalName, handler);
  }

  public render() {
    return false;
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(InteractionPreviewController);
