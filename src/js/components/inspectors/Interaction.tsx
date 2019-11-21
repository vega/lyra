'use strict';

import * as React from 'react';
import {connect} from 'react-redux';
import {State} from '../../store';
import {InteractionRecord} from '../../store/factory/Interaction';
import {Property} from './Property';

interface OwnProps {
  primId: number;

}

interface OwnState {
  value: string;

}

interface StateProps {
  interaction: InteractionRecord;
}


function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  return {
    interaction: state.getIn(['vis', 'present', 'interactions',  String(ownProps.primId)])
  };
}

class BaseInteractionInspector extends React.Component<OwnProps & StateProps, OwnState> {
  constructor(props) {
    super(props);

    this.state = {
      value: null
    }
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  public render() {
    const channels = ['opacity', 'color', 'size']
    const options = channels.map(e=> {
      return <option key={e} value={e}>{e}</option>
    })

    const props = this.props;
    const interaction = this.props.interaction;
    const selectionDef = interaction.get('selectionDef');
    const mappingDef = interaction.get('mappingDef');
    return (
      <div>
        <div className='property-group'>
          <h3 className='label'>Placeholder</h3>
          <ul>
            <li>Name: {interaction.get('name')}</li>
            <li>Selection: {selectionDef ? selectionDef.label : ''}</li>
            <li>Mapping: {mappingDef ? mappingDef.label : ''}</li>
          </ul>
        </div>

        <div className='property-group'>
          <h3 className='label'>Settings</h3>
          <ul>
          Channel :
          <select value={mappingDef.id} onChange={this.handleChange}>
            {options}
          </select>

          <Property name='field' label='Field' type='number' canDrop={true} {...props} />
          </ul>
        </div>
      </div>
    );
  }
};

export const InteractionInspector = connect(mapStateToProps)(BaseInteractionInspector);
