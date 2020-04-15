import * as React from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip'
import { AnyAction } from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {selectInteraction, InspectorSelectedType, selectMark} from '../../actions/inspectorActions';
import {State} from '../../store';
import { Icon } from '../Icon';
import {InteractionRecord, Interaction, ScaleInfo} from '../../store/factory/Interaction';
import {addInteraction, deleteInteraction, updateInteractionName} from '../../actions/interactionActions';
import {getScaleInfoForGroup} from '../../ctrl/demonstrations';

const ContentEditable = require('../ContentEditable');
const assets = require('../../util/assets');
const ctrl = require('../../ctrl');

interface OwnProps {
  groupId: number;
  selectedId?: number;
  selectedType?: InspectorSelectedType;
}
interface StateProps {
  interactions: InteractionRecord[];
  canDemonstrate: boolean;
}

interface DispatchProps {

  addInteraction: (groupId: number) => void;
  selectInteraction: (interactionId: number) => void;
  deleteInteraction: (selectedId: number, groupId: number, interactionId: number, evt: any) => void;
  updateName: (interactionId: number, value: string) => void;
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  const scaleInfo: ScaleInfo = getScaleInfoForGroup(state, ownProps.groupId);
  const isParsing = state.getIn(['vega', 'isParsing']);
  const canDemonstrate = Boolean(!isParsing && ctrl.view && (scaleInfo.xScaleName && scaleInfo.xFieldName || scaleInfo.yScaleName && scaleInfo.yFieldName));

  const interactions = state.getIn(['vis', 'present', 'marks', String(ownProps.groupId), '_interactions']);
  return {
    interactions: interactions ? interactions.map(function(interactionId) {
      return state.getIn(['vis', 'present', 'interactions', String(interactionId)]);
    }) : [],
    canDemonstrate
  };
}

function mapDispatchToProps(dispatch: ThunkDispatch<State, null, AnyAction>): DispatchProps {
  return {
    addInteraction: (groupId) => {
      const record = Interaction({
        groupId
      });
      dispatch(addInteraction(record));
    },

    selectInteraction: function(interactionId) {
      dispatch(selectInteraction(interactionId));
    },

    deleteInteraction: function (selectedId, groupId, interactionId, evt) {
      if (selectedId === interactionId) {
        dispatch(selectMark(groupId));
      }
      dispatch(deleteInteraction({groupId}, interactionId));
      evt.preventDefault();
      evt.stopPropagation();
      ReactTooltip.hide();
    },

    updateName: function(interactionId, value) {
      dispatch(updateInteractionName(value, interactionId));
    },
  };
}


class InteractionList extends React.Component<OwnProps & StateProps & DispatchProps> {

  public componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  public render() {
    const props = this.props;
    const selectedId = props.selectedId;
    const selectedType = props.selectedType;

    return (
      <div className='interaction-list'>
        <li className='header'>
          Interactions {this.props.canDemonstrate ? <Icon glyph={assets.plus} onClick={() => this.props.addInteraction(this.props.groupId)} /> : null}
        </li>

        {props.interactions.map(function(interaction) {
          const interactionId = interaction.id;
          const name = interaction.name;

          return (
            <li key={interactionId}>
              <div className={'name' + (selectedId === interactionId && selectedType === InspectorSelectedType.SELECT_INTERACTION ? ' selected' : '')}
                onClick={props.selectInteraction.bind(null, interactionId)}>

                <Icon glyph={assets.select} />

                <ContentEditable value={name}
                  save={props.updateName.bind(null, interactionId)}
                  onClick={props.selectInteraction.bind(null, interactionId)} />

                <Icon glyph={assets.trash} className='delete'
                  onClick={props.deleteInteraction.bind(null, selectedId, this.props.groupId, interactionId)}
                  data-tip={'Delete ' + name} data-place='right' />
              </div>
            </li>
          );
        }, this)}
      </div>
    );
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(InteractionList);
