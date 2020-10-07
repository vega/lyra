'use strict';

const getInVis = require('../../util/immutable-utils').getInVis;

import * as React from 'react';
import {connect} from 'react-redux';
import {State} from '../../store';
import { Dispatch } from 'redux';
import {PrimType} from '../../constants/primTypes';
import {Property} from './Property';
import {ScaleRecord} from '../../store/factory/Scale';
import { updateScaleProperty } from '../../actions/scaleActions';

interface OwnProps {
  primId: number;
  primType: PrimType;

}

interface StateProps {
  scale: ScaleRecord;
}

interface DispatchProps {
  updateScaleProperty: (scaleId: number, property: string, value: any) => void;
}


function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  console.log(getInVis(state, 'scales.' + ownProps.primId))
  return {
    scale: getInVis(state, 'scales.' + ownProps.primId)
  };
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    updateScaleProperty: function (scaleId, property, value) {
      dispatch(updateScaleProperty({ property, value }, scaleId));
    }
  };
}

class BaseScaleInspector extends React.Component<OwnProps & StateProps & DispatchProps> {

  public handleChange(evt) {
    const guideId = this.props.primId;
    const target = evt.target;
    const property = target.name;
    let value = (target.type === 'checkbox') ? target.checked : target.value;

    // Parse number or keep string around.
    value = value === '' || isNaN(+value) ? value : +value;
    this.props.updateScaleProperty(guideId, property, value);
  };

  public render() {
    const props = this.props;
    const scale = props.scale;
    const typeOpts = ['linear', 'log', 'time', 'ordinal', 'point'];
    return (
      <div>
        <div className='property-group'>
          <h3 className='label'>Placeholder</h3>
          <ul>
            <li>name: {scale.get('name')}</li>
            <li>type: {scale.get('type')}</li>

            <Property name='type' label='Type' type='select' opts={typeOpts} onChange={(e) => this.handleChange(e)} {...props} />

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

export const ScaleInspector = connect(mapStateToProps, mapDispatchToProps)(BaseScaleInspector);
