'use strict';

import * as React from 'react';
import {connect} from 'react-redux';
import {State} from '../../store';
import {InteractionRecord} from '../../store/factory/Interaction';

interface OwnProps {
  primId: number;

}

interface StateProps {
  interaction: InteractionRecord;
}


function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  return {
    interaction: state.getIn(['vis', 'present', 'interactions',  String(ownProps.primId)])
  };
}

class BaseInteractionInspector extends React.Component<OwnProps & StateProps> {
  public render() {
    const interaction = this.props.interaction;
    return (
      <div>
        <div className='property-group'>
          <h3 className='label'>Placeholder</h3>
          <ul>
            <li>Name: {interaction.get('name')}</li>
            <li>Selection: {interaction.get('selectionType')}</li>
            <li>Mapping: {interaction.get('mappingType')}</li>
          </ul>
        </div>
      </div>
    );
  }
};

export const InteractionInspector = connect(mapStateToProps)(BaseInteractionInspector);
