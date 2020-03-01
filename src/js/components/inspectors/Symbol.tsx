import * as React from 'react';
import {Property} from './Property';
import {PrimType} from '../../constants/primTypes';
import {SymbolShapes} from '../../store/factory/marks/Symbol';

interface SymbolInspectorProps {
  primId: number,
  primType: PrimType
}

class BaseSymbolInspector extends React.Component<SymbolInspectorProps> {
  public render() {
    const props = this.props;
    console.log(props);
    return (
      <div>
        <div className='property-group'>
          <h3>Position</h3>

          <Property name='x' label='X' type='number' canDrop={true} {...props} />

          <Property name='y' label='Y' type='number' canDrop={true} {...props} />
        </div>

        <div className='property-group'>
          <h3>Geometry</h3>

          <Property name='shape' label='Shape' type='select' opts={SymbolShapes}
            canDrop={true} {...props} />

          <Property name='size' label='Size' type='number' canDrop={true} {...props} />

        </div>

        <div className='property-group'>
          <h3>Fill</h3>

          <Property name='fill' label='Color' type='color' canDrop={true} {...props} />

          <Property name='fillOpacity' label='Opacity' type='range'
            min='0' max='1' step='0.05' canDrop={true} {...props} />

        </div>

        <div className='property-group'>
          <h3>Stroke</h3>

          <Property name='stroke' label='Color' type='color' canDrop={true} {...props} />

          <Property name='strokeWidth' label='Width' type='range'
            min='0' max='10' step='0.25' canDrop={true} {...props} />
        </div>
      </div>
    );
  }
};

export const SymbolInspector = BaseSymbolInspector;
