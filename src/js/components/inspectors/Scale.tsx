'use strict';

const getInVis = require('../../util/immutable-utils').getInVis;

import * as React from 'react';
import {connect} from 'react-redux';
import {State} from '../../store';
import {PrimType} from '../../constants/primTypes';
import {ScaleRecord} from '../../store/factory/Scale';

interface OwnProps {
  primId: number;
  primType: PrimType;

}

interface StateProps {
  scale: ScaleRecord;
}


function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  return {
    scale: getInVis(state, 'scales.' + ownProps.primId)
  };
}

class BaseScaleInspector extends React.Component<OwnProps & StateProps> {
  public render() {
    const scale = this.props.scale;
    return (
      <div>
        <div className='property-group'>
          <h3 className='label'>Placeholder</h3>
          <ul>
            <li>name: {scale.get('name')}</li>
            <li>type: {scale.get('type')}</li>
            {/* <li>range: {scale.get('range')}</li> TODO */}
          </ul>
        </div>
      </div>
    );
  }
};

export const ScaleInspector = connect(mapStateToProps)(BaseScaleInspector);
