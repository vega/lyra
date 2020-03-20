const INTERPOLATE = require('../../constants/interpolate');

import * as React from 'react';
import {PrimType} from '../../constants/primTypes';
import {Property} from './Property';

interface LineInspectorProps {
  primId: number;
  primType: PrimType

}
class BaseLineInspector extends React.Component<LineInspectorProps> {
  public render() {
    const props = this.props;
    return (
      <div>
        <div className='property-group'>
          <h3>Position</h3>

          <Property name='x' label='X' type='number' droppable={true} {...props} />

          <Property name='y' label='Y' type='number' droppable={true} {...props} />
        </div>

        <div className='property-group'>
          <h3>Stroke</h3>

          <Property name='stroke' label='Color' type='color' droppable={true} {...props} />

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

export const LineInspector = BaseLineInspector;
