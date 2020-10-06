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
  console.log(getInVis(state, 'scales.' + ownProps.primId))
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
            <li>range: {JSON.stringify(scale.get('range'))}</li>
            <li>domain: {JSON.stringify(scale.get('_domain'))}</li>
            <li>domainMin: {scale.get('domainMin')}</li>
            <li>domainMax: {scale.get('domainMax')}</li>
            <li>domainMid: {scale.get('domainMid')}</li>
            <li>domainRaw: {scale.get('domainRaw')}</li>
            <li>reverse: {scale.get('reverse')}</li>
            <li>round: {scale.get('round')}</li>
            <li>nice*: {scale.get('nice')+''}</li>
            <li>exponent*: {scale.get('exponent') + ''}</li>
            <li>align*: {scale.get('align') + ''}</li>
            <li>padding*: {scale.get('padding') + ''}</li>
            <li>paddingOuter*: {scale.get('paddingOuter') + ''}</li>
          </ul>
        </div>
      </div>
    );
  }
};

export const ScaleInspector = connect(mapStateToProps)(BaseScaleInspector);
