import {Map} from 'immutable';
import * as React from 'react';
import ReactTooltip from 'react-tooltip'
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import {selectInteraction} from '../../actions/inspectorActions';
import {State} from '../../store';
import {InteractionRecord} from '../../store/factory/Interaction';
import {Icon} from '../Icon';
import {deleteInteraction} from '../../actions/interactionActions';
import {getScaleInfoForGroup} from '../../ctrl/demonstrations';

const ContentEditable = require('../ContentEditable');
const imutils = require('../../util/immutable-utils');
const assets = require('../../util/assets');
const getInVis = imutils.getInVis;

interface StateProps {
  selectedId: number;
  interactions: Map<string, InteractionRecord>;
  scales
}

interface DispatchProps {
  selectInteraction: (id: number) => void;
  deleteInteraction: (selectedId: number, interactionId: number, evt: any) => void;
}

function mapStateToProps(reduxState: State): StateProps {
  const interactions =  getInVis(reduxState, 'interactions')
  const scales = [...interactions.values()].map(interaction => {
    const scaleInfo = getScaleInfoForGroup(reduxState, interaction.groupId);
    return {x: scaleInfo.xFieldName, y: scaleInfo.yFieldName}
  })
  return {
    selectedId: reduxState.getIn(['inspector', 'encodings', 'selectedId']),
    interactions,
    scales
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps): DispatchProps {
  return {
    selectInteraction: function(id) {
      dispatch(selectInteraction(id));
    },

    deleteInteraction: function (selectedId, interactionId, evt) {
      if (selectedId === interactionId) {
        dispatch(selectInteraction(ownProps.groupId));
      }
      dispatch(deleteInteraction(null, interactionId));
      evt.preventDefault();
      evt.stopPropagation();
      ReactTooltip.hide();
    }
  };
}

class InteractionList extends React.Component<StateProps & DispatchProps> {

  public handleDragStart = (evt) => {
    evt.dataTransfer.setData('signalName', evt.target.innerText);
    evt.dataTransfer.setData('type', 'interaction');
  }

  public render() {
    const props = this.props;
    const interactions = [...props.interactions.values()]
    return (
      <div id='interaction-list'>
        <h2>Interactions</h2>
        <ul>
          {interactions.map(function(interaction, i) {
            const id = interaction.get('id');
            const name = interaction.get('name');

            return (
              <li key={id}
                onClick={props.selectInteraction.bind(null, id)}>
                <div className={props.selectedId === id ? 'selected interaction name' : 'interaction name'}>
                  {/* <ContentEditable value={name} save={updateScaleName} /> */}
                  {name}
                  {
                    interaction.get('selectionDef') && interaction.get('selectionDef').id.startsWith('brush') ? (
                      <div>
                        <div onDragStart={this.handleDragStart} draggable={true} className={'signal'}>
                          {'brush_'+this.props.scales[i].x+'_x'}
                        </div>
                        <div onDragStart={this.handleDragStart} draggable={true} className={'signal'}>
                          {'brush_'+this.props.scales[i].y+'_y'}
                        </div>
                      </div>
                    ) : interaction.get('selectionDef') && interaction.get('selectionDef').id.startsWith('widget') ? (
                        <div>
                          <div className={'signal'}>
                            widget
                        </div>
                        </div>
                    ) : (
                      <div>
                        <div className={'signal'}>
                          points
                        </div>
                      </div>
                    )
                  }
                  <Icon glyph={assets.trash} className='delete'
                    onClick={(e) => props.deleteInteraction(props.selectedId, id, e)}
                  data-tip={'Delete ' + name} data-place='right' />
                </div>
              </li>
            );
          }, this)}
        </ul>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InteractionList);
