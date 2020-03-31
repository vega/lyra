import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../../store';
import {getScaleInfoForGroup} from '../../ctrl/demonstrations';
import {Interaction, ScaleInfo, InteractionRecord, InteractionInput} from '../../store/factory/Interaction';
import {Dispatch} from 'redux';
import {addInteraction, setInput} from '../../actions/interactionActions';
import {GroupRecord} from '../../store/factory/marks/Group';
import {addInteractionToGroup} from '../../actions/bindChannel/helperActions';
import {selectInteraction, InspectorSelectedType} from '../../actions/inspectorActions';
import {EncodingStateRecord} from '../../store/factory/Inspector';
import {Icon} from '../Icon';
import exportName from '../../util/exportName';

const ctrl = require('../../ctrl');
const listeners = require('../../ctrl/listeners');
const assets = require('../../util/assets');

interface OwnProps {
  groupId: number;
}

interface StateProps {
  canDemonstrate: Boolean;
  interaction: InteractionRecord;
  isInteractionSelected: boolean;
  groupName: string;
}

interface DispatchProps {
  addInteraction: (groupId: number) => number; // return newly created interaction
  setInput: (input: InteractionInput, id: number) => void;
  selectInteraction: (id: number) => void;
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

  const isInteractionSelected = interactionId ? interactionId === selId : false;

  return {
    canDemonstrate,
    interaction,
    isInteractionSelected,
    groupName: exportName(group.name)
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
    setInput: (input: InteractionInput, id: number) => {
      dispatch(setInput(input, id));
    },
    selectInteraction: (id: number) => {
      dispatch(selectInteraction(id));
    }
  };
}

class InteractionPreviewController extends React.Component<OwnProps & StateProps & DispatchProps> {

  constructor(props) {
    super(props);
  }

  public componentDidUpdate(prevProps: StateProps, prevState) {
    if (!prevProps.canDemonstrate && this.props.canDemonstrate) {
      this.restoreSignalValues(this.props.groupName);
      this.onSignal(this.props.groupName, 'grid_translate_anchor', (name, value) => this.onMainViewGridSignal(name, value));
      this.onSignal(this.props.groupName, 'grid_translate_delta', (name, value) => this.onMainViewGridSignal(name, value));
      this.onSignal(this.props.groupName, 'brush_x', (name, value) => this.onMainViewIntervalSignal(name, value));
      this.onSignal(this.props.groupName, 'brush_y', (name, value) => this.onMainViewIntervalSignal(name, value));
      this.onSignal(this.props.groupName, 'points_tuple', (name, value) => this.onMainViewPointSignal(name, value));
      this.onSignal(this.props.groupName, 'points_toggle', (name, value) => this.onMainViewPointSignal(name, value));
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
    const isDemonstratingInterval = intervalActive || !pointActive;

    const inputKeyboard: InteractionInput = (window as any)._inputKeyboard;

    if (this.props.canDemonstrate && isDemonstrating) {
      if (!this.props.isInteractionSelected) {
        if (!this.props.interaction) {
          const interactionId = this.props.addInteraction(this.props.groupId);
          this.props.setInput({
            mouse: isDemonstratingInterval ? 'drag' : 'click',
            keycode: inputKeyboard ? inputKeyboard.keycode : undefined,
            _key: inputKeyboard ? inputKeyboard._key : undefined
          }, interactionId)
          this.props.selectInteraction(interactionId);
        }
        else {
          this.props.selectInteraction(this.props.interaction.id);
        }
      }
    }
  }

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
    return this.props.canDemonstrate ? <Icon glyph={assets.plus} onClick={() => this.props.addInteraction(this.props.groupId)} /> : null;
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(InteractionPreviewController);
