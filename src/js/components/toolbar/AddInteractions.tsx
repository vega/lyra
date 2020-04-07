import * as React from 'react';
import { connect } from 'react-redux';
import {addInteraction} from '../../actions/interactionActions';
import { Icon } from '../Icon';
import {InteractionRecord, Interaction, ScaleInfo} from '../../store/factory/Interaction';
import {getClosestGroupId} from '../../util/hierarchy';
import {State} from '../../store';
import {getScaleInfoForGroup} from '../../ctrl/demonstrations';
import {ThunkDispatch} from 'redux-thunk';
import {AnyAction} from 'redux';
import {addInteractionToGroup} from '../../actions/bindChannel/helperActions';

const assets = require('../../util/assets');
const ctrl = require('../../ctrl');

interface StateProps {
  groupId: number,
  canDemonstrate: boolean
}

function mapStateToProps(state: State): StateProps {
  const groupId = getClosestGroupId();
  const scaleInfo: ScaleInfo = getScaleInfoForGroup(state, groupId);

  const isParsing = state.getIn(['vega', 'isParsing']);

  const canDemonstrate = Boolean(!isParsing && ctrl.view && (scaleInfo.xScaleName && scaleInfo.xFieldName || scaleInfo.yScaleName && scaleInfo.yFieldName));
  return {
    groupId,
    canDemonstrate
  }
}

interface DispatchProps {
  addInteraction: (groupId: number) => number;
}

function mapDispatchToProps(dispatch: ThunkDispatch<State, null, AnyAction>): DispatchProps {
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
  }
}
class AddInteractionsTool extends React.Component<StateProps & DispatchProps> {

  public render() {
    if (!this.props.canDemonstrate) {
      return null;
    }
    return (
      <ul className='add-interactions'>
        <li
          onClick={() => this.props.addInteraction(this.props.groupId)}
        >
          <Icon glyph={assets.select} /> Interaction
        </li>
      </ul>
    );
  }
}

export const AddInteractions = connect(
  mapStateToProps,
  mapDispatchToProps
)(AddInteractionsTool);
