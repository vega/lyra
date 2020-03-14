import * as React from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip'
import { AnyAction } from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {selectInteraction, InspectorSelectedType} from '../../actions/inspectorActions';
import {State} from '../../store';
import { Icon } from '../Icon';
import {InteractionRecord, Interaction} from '../../store/factory/Interaction';
import {deleteInteraction, updateInteractionName, addInteraction} from '../../actions/interactionActions';
import {addInteractionToGroup} from '../../actions/bindChannel/helperActions';
import InteractionPreviewController from '../interactions/InteractionPreviewController';

const ContentEditable = require('../ContentEditable');
const assets = require('../../util/assets');

interface OwnProps {
  groupId: number;
  selectedId?: number;
  selectedType?: InspectorSelectedType;
}
interface StateProps {
  interactions: InteractionRecord[];
}

interface DispatchProps {
  selectInteraction: (interactionId: number) => void;
  deleteInteraction: (selectedId: number, groupId: number, interactionId: number, evt: any) => void;
  updateName: (interactionId: number, value: string) => void;
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  const interactions = state.getIn(['vis', 'present', 'marks', String(ownProps.groupId), '_interactions']);
  return {
    interactions: interactions ? interactions.map(function(interactionId) {
      return state.getIn(['vis', 'present', 'interactions', String(interactionId)]);
    }) : []
  };
}

function mapDispatchToProps(dispatch: ThunkDispatch<State, null, AnyAction>): DispatchProps {
  return {
    selectInteraction: function(interactionId) {
      dispatch(selectInteraction(interactionId));
    },

    deleteInteraction: function (selectedId, groupId, interactionId, evt) {
      if (selectedId === interactionId) {
        dispatch(selectInteraction(groupId));
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
          Interactions <InteractionPreviewController groupId={this.props.groupId}></InteractionPreviewController>
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
                  onClick={props.deleteInteraction.bind(null, selectedId, interactionId)}
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



// import {Map} from 'immutable';
// import * as React from 'react';
// import ReactTooltip from 'react-tooltip'
// import { connect } from 'react-redux';
// import { Dispatch } from 'redux';
// import {selectInteraction} from '../../actions/inspectorActions';
// import {State} from '../../store';
// import {InteractionRecord} from '../../store/factory/Interaction';
// import {Icon} from '../Icon';
// import {deleteInteraction} from '../../actions/interactionActions';
// import {getScaleInfoForGroup} from '../../ctrl/demonstrations';
// import {GroupRecord} from '../../store/factory/marks/Group';
// import {MarkRecord} from '../../store/factory/Mark';

// const ContentEditable = require('../ContentEditable');
// const imutils = require('../../util/immutable-utils');
// const assets = require('../../util/assets');
// const getInVis = imutils.getInVis;

// interface StateProps {
//   selectedId: number;
//   groups: GroupRecord[];
//   interactions: Map<string, InteractionRecord>;
//   scales
// }

// interface DispatchProps {
//   selectInteraction: (id: number) => void;
//   deleteInteraction: (selectedId: number, groupId: number, interactionId: number, evt: any) => void;
// }

// function mapStateToProps(reduxState: State): StateProps {
//   const marks: Map<string, MarkRecord> =  getInVis(reduxState, 'marks');
//   const groups = [...marks.values()].filter((mark) => mark.type === 'group') as GroupRecord[];
//   const interactions =  getInVis(reduxState, 'interactions');
//   const scales = [...interactions.values()].map(interaction => {
//     const scaleInfo = getScaleInfoForGroup(reduxState, interaction.groupId);
//     return {x: scaleInfo.xFieldName, y: scaleInfo.yFieldName}
//   })
//   return {
//     selectedId: reduxState.getIn(['inspector', 'encodings', 'selectedId']),
//     groups,
//     interactions,
//     scales,
//   };
// }

// function mapDispatchToProps(dispatch: Dispatch, ownProps): DispatchProps {
//   return {
//     selectInteraction: function(id) {
//       dispatch(selectInteraction(id));
//     },

//     deleteInteraction: function (selectedId, groupId, interactionId, evt) {
//       if (selectedId === interactionId) {
//         dispatch(selectInteraction(groupId));
//       }
//       dispatch(deleteInteraction({groupId}, interactionId));
//       evt.preventDefault();
//       evt.stopPropagation();
//       ReactTooltip.hide();
//     }
//   };
// }

// class InteractionList extends React.Component<StateProps & DispatchProps> {

//   public handleDragStart = (evt) => {
//     evt.dataTransfer.setData('signalName', evt.target.innerText);
//     evt.dataTransfer.setData('type', 'interaction');
//   }

//   public render() {
//     const props = this.props;
//     return (
//       <div id='interaction-list'>
//         <h2>Interactions</h2>
//         {
//           props.groups.map((group) => {
//             const groupId = group._id
//             const groupName = group.name;
//             const groupInteractions = group._interactions;
//             if (groupInteractions && groupInteractions.length) {
//               return (
//                 <div key={groupId} className='interaction-list__group'>
//                   <h5>{groupName}</h5>
//                   <ul>
//                     {
//                       [...groupInteractions.values()].map((interactionId, i) => {
//                         const interaction = props.interactions.get(String(interactionId));
//                         const id = interaction.get('id');
//                         const name = interaction.get('name');

//                         return (
//                           <li key={id}
//                             onClick={props.selectInteraction.bind(null, id)}>
//                             <div className={props.selectedId === id ? 'selected interaction name' : 'interaction name'}>
//                               {/* <ContentEditable value={name} save={updateScaleName} /> */}
//                               {name}
//                               {
//                                 interaction.get('selectionDef') && interaction.get('selectionDef').id.startsWith('brush') ? (
//                                   <div>
//                                     <div onDragStart={this.handleDragStart} draggable={true} className={'signal'}>
//                                       {'brush_'+this.props.scales[i].x+'_x'}
//                                     </div>
//                                     <div onDragStart={this.handleDragStart} draggable={true} className={'signal'}>
//                                       {'brush_'+this.props.scales[i].y+'_y'}
//                                     </div>
//                                   </div>
//                                 ) : interaction.get('selectionDef') && interaction.get('selectionDef').id.startsWith('widget') ? (
//                                     <div>
//                                       <div className={'signal'}>
//                                         widget
//                                     </div>
//                                     </div>
//                                 ) : (
//                                   <div>
//                                     <div className={'signal'}>
//                                       points
//                                     </div>
//                                   </div>
//                                 )
//                               }
//                               <Icon glyph={assets.trash} className='delete'
//                                 onClick={(e) => props.deleteInteraction(props.selectedId, groupId, id, e)}
//                               data-tip={'Delete ' + name} data-place='right' />
//                             </div>
//                           </li>
//                         );
//                       })
//                     }
//                   </ul>
//                 </div>
//               );
//             }
//           })
//         }

//       </div>
//     );
//   }
// }

// export default connect(mapStateToProps, mapDispatchToProps)(InteractionList);
