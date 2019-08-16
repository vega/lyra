const INTERPOLATE = require('../../constants/interpolate');

import * as React from 'react';
import {Property} from './Property';
import {PrimType} from '../../constants/primTypes';

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

          <Property name='x' label='X' type='number' canDrop={true} {...props} />

          <Property name='y' label='Y' type='number' canDrop={true} {...props} />
        </div>

        <div className='property-group'>
          <h3>Stroke</h3>

          <Property name='stroke' label='Color' type='color' canDrop={true} {...props} />

          <Property name='strokeWidth' label='Width' type='range'
            min='0' max='10' step='0.25' canDrop={true} {...props} />
        </div>

        <div className='property-group'>
          <h3>Line Strength</h3>

          <Property name='interpolate' label='Interpolate' type='select'
            opts={INTERPOLATE} canDrop={true} {...props} />

          <Property name='tension' label='Tension' type='number'
            canDrop={true} {...props} />
        </div>
      </div>
    );
  }
};

export const LineInspector = BaseLineInspector;
