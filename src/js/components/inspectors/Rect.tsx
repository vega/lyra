'use strict';

import * as React from 'react';
import {PrimType} from '../../constants/primTypes';
import {ExtentProperty} from './ExtentProperty';
import {Property} from './Property';

interface RectInspectorProps {
  primId: number,
  primType: PrimType
}

class BaseRectInspector extends React.Component<RectInspectorProps> {

  public render() {
    const props = this.props;
    return (
      <div>
        <div className='property-group'>
          <h3>X Position</h3>

          <ExtentProperty exType='x' {...props} />
        </div>

        <div className='property-group'>
          <h3>Y Position</h3>

          <ExtentProperty exType='y' {...props} />
        </div>

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
      </div>
    );
  }
};
export const RectInspector = BaseRectInspector;
