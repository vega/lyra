'use strict';

const getInVis = require('../../util/immutable-utils').getInVis;

import * as React from 'react';
import {connect} from 'react-redux';
import {State} from '../../store';

interface OwnProps {
  primId: number
}

interface StateProps {
  scale: any
}

interface ScaleInspectorProps {
  primId: number,
  primType: any,
  scale: any, // TODO: should be Immutable.Map
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  return {
    scale: getInVis(state, 'scales.' + ownProps.primId)
  };
}

class BaseScaleInspector extends React.Component<ScaleInspectorProps> {
  public render() {
    const scale = this.props.scale;
    return (
      <div>
        <div className='property-group'>
          <h3 className='label'>Placeholder</h3>
          <ul>
            <li>name: {scale.get('name')}</li>
            <li>type: {scale.get('type')}</li>
            <li>range: {scale.get('range')}</li>
          </ul>
        </div>
      </div>
    );
  }
};

export const ScaleInspector = connect(mapStateToProps)(BaseScaleInspector);
