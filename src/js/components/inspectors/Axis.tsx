'use strict';

import * as React from 'react';
import {connect} from 'react-redux';
import {MoreProperties} from './MoreProperties';
import {Property} from './Property';
import {PrimType} from '../../constants/primTypes';

interface AxisProps {
  primId: number,
  primType: PrimType,
  handleChange: (evt) => void
}

class BaseAxisInspector extends React.Component<AxisProps> {

  public render() {
    const props = this.props;
    const handleChange = props.handleChange;
    const orientOpts = ['top', 'bottom', 'left', 'right'];
    const layerOpts = ['back', 'front'];
    const axis   = 'encode.axis.update.';
    const title  = 'encode.title.update.';
    const labels = 'encode.labels.update.';
    const grid = 'encode.grid.update.';
    const ticks = 'encode.ticks.update.';

    return (
      <div>
        <div className='property-group'>
          <h3>Axis</h3>

          <Property name='orient' label='Orient' type='select'
            opts={orientOpts} onChange={handleChange} {...props} />

          <MoreProperties label='Axis'>
            <Property name={axis + 'stroke.value'} label='Color' type='color' {...props} />

            <Property name={axis + 'strokeWidth.value'} label='Width' type='range'
              min='0' max='10' step='0.25' {...props} />
          </MoreProperties>
        </div>

        <div className='property-group'>
          <h3>Title</h3>

          <Property name='title' label='Text' type='text'
            onChange={handleChange} {...props} />

          <Property name={title + 'fontSize.value'} label='Font Size' type='number' onChange={handleChange} {...props} />

          <MoreProperties label='Title'>
            <Property name={title + 'fill.value'} label='Color' type='color' onChange={handleChange} {...props} />

            <Property name='titleOffset' label='Offset' type='number'
              onChange={handleChange} {...props} />
          </MoreProperties>
        </div>

        <div className='property-group'>
          <h3>Labels</h3>

          <Property name={labels + 'fontSize.value'} label='Font Size' type='number' onChange={handleChange} {...props} />

          <Property name={labels + 'angle.value'} label='Angle' type='number'
            min='0' max='360' onChange={handleChange} {...props} />

          <MoreProperties label='Label'>
            <Property name={labels + 'fill.value'} label='Fill' type='color' onChange={handleChange} {...props} />
          </MoreProperties>
        </div>

        <div className='property-group'>
          <h3>Grid</h3>

          <Property name='grid' label='Grid' type='checkbox'
            onChange={handleChange} {...props}/>

          <Property name='layer' label='Layer' type='select' opts={layerOpts}
            onChange={handleChange} {...props} />

          <MoreProperties label='Grid'>
            <Property name={grid + 'stroke.value'} label='Color' type='color' onChange={handleChange} {...props} />

            <Property name={grid + 'strokeOpacity.value'} label='Opacity' type='range'
              min='0' max='1' step='0.05' onChange={handleChange} {...props} />

            <Property name={grid + 'strokeWidth.value'} label='Width' type='range'
              min='0' max='10' step='0.25' onChange={handleChange} {...props} />
          </MoreProperties>
        </div>

        <div className='property-group last'>
          <MoreProperties label='Ticks' header='true'>
            <Property name='tickCount' label='Number of Ticks' type='number'
              onChange={handleChange} {...props} />

            <Property name={ticks + 'stroke.value'} label='Color' type='color' onChange={handleChange} {...props} />

            <Property name={ticks + 'strokeWidth.value'} label='Width' type='range'
              min='0' max='10' step='0.25' onChange={handleChange} {...props} />

            <Property name='tickPadding' label='Padding' type='range'
              onChange={handleChange} {...props} />

            <Property name='tickSize' label='Size' type='number'
              onChange={handleChange} {...props} />
          </MoreProperties>
        </div>
      </div>
    );
  }
};

export const AxisInspector = connect()(BaseAxisInspector);
