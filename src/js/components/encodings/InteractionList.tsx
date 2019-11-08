import {Map} from 'immutable';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import {selectInteraction} from '../../actions/inspectorActions';
import {State} from '../../store';
import {InteractionRecord} from '../../store/factory/Interaction';

const ContentEditable = require('../ContentEditable');
const imutils = require('../../util/immutable-utils');
const getInVis = imutils.getInVis;

interface StateProps {
  selectedId: number;
  interactions: Map<string, InteractionRecord>;
}

interface DispatchProps {
  selectInteraction: (id: number) => void;
}

function mapStateToProps(reduxState: State, ownProps): StateProps {
  return {
    selectedId: reduxState.getIn(['inspector', 'encodings', 'selectedId']),
    interactions: getInVis(reduxState, 'interactions')
  };
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    selectInteraction: function(id) {
      dispatch(selectInteraction(id));
    }
  };
}

class InteractionList extends React.Component<StateProps & DispatchProps> {
  public render() {
    const props = this.props;
    const interactions = [...props.interactions.values()]

    return (
      <div id='interaction-list'>
        <h2>Interactions</h2>
        <ul>
          {interactions.map(function(interaction) {
            const id = interaction.get('id');
            const name = interaction.get('name');

            return (
              <li key={id}
                onClick={props.selectInteraction.bind(null, id)}>
                <div className={props.selectedId === id ? 'selected interaction name' : 'interaction name'}>
                  {/* <ContentEditable value={name} save={updateScaleName} /> */}
                  {name}
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
