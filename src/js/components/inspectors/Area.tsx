'use strict';
const INTERPOLATE = require('../../constants/interpolate');
const getInVis = require('../../util/immutable-utils').getInVis;

import * as React from 'react';
import {connect} from 'react-redux';
import {PrimType} from '../../constants/primTypes';
import {Property} from './Property';
import {ExtentProperty} from './ExtentProperty';
import {State} from '../../store';

const Area = {
  'ORIENT': [
    'vertical',
    'horizontal'
]};

interface OwnProps {
  primId: number,
  primType: PrimType
}

interface StateProps {
  orient: string;
}

function mapStateToProps(reduxState: State, ownProps: OwnProps): StateProps {
  const primId = ownProps.primId;
  const orientSignal = reduxState.getIn(['vis', 'present', 'marks', String(primId), 'encode', 'update', 'orient', 'signal']);
  return {
    orient: reduxState.getIn(['vis', 'present', 'signals', orientSignal, 'value'])
  };
}
class BaseArea extends React.Component<OwnProps & StateProps> {
  public render() {
    const props = this.props;
    return (
      <div>
        {/* Decided not to expose  orientation as the expected behavior is unclear */}
        {/* <div className="property-group">
          <h3>Orientation</h3>

          <Property name="orient" label="Orient" type="select"
            opts={Area.ORIENT} {...props} />
        </div> */}

        <h3 className='label'>X Position</h3>
        {props.orient === 'vertical' ?
            <Property name='x' type='number' droppable={true} {...props} />

          :
            <ExtentProperty exType='x' {...props} />
        }

        <h3>Y Position</h3>
        {props.orient === 'vertical' ?
            <ExtentProperty exType='y' {...props} />
          :
            <Property name='y' type='number' droppable={true} {...props} />
        }

        <div className='property-group'>
          <h3>Fill</h3>

          <Property name='fill' label='Color' type='color'
            droppable={true} {...props} />

          <Property name='fillOpacity' label='Opacity' type='range'
            min='0' max='1' step='0.05' droppable={true} {...props} />
        </div>

        <div className='property-group'>
          <h3>Stroke</h3>

          <Property name='stroke' label='Color' type='color'
            droppable={true} {...props} />

          <Property name='strokeWidth' label='Width' type='range'
            min='0' max='10' step='0.25' droppable={true} {...props} />
        </div>

        <div className='property-group'>
          <h3>Line Strength</h3>

          <Property name='interpolate' label='Interpolate' type='select'
            opts={INTERPOLATE} droppable={true} {...props} />

          <Property name='tension' label='Tension' type='number'
            droppable={true} {...props} />
        </div>
      </div>
    );
  }
};
export const AreaInspector = connect(mapStateToProps)(BaseArea);
