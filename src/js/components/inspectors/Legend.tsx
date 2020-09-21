'use strict';
const getInVis = require('../../util/immutable-utils').getInVis;

import * as React from 'react';
import {connect} from 'react-redux';
import {State} from '../../store';
import {MoreProperties} from './MoreProperties';
import {Property} from './Property';
import {PrimType} from '../../constants/primTypes';
import {SymbolShapes} from '../../store/factory/marks/Symbol';

interface OwnProps {
  primId: number;
  primType: PrimType;
  handleChange: (evt: any) => void;

}

interface StateProps {
  legendType?: string;
  scaleType?: string;
}

function mapStateToProps(reduxState: State, ownProps: OwnProps): StateProps {
  const guide = getInVis(reduxState, 'guides.' + ownProps.primId);
  const type  = guide.get('_type');
  const scale = getInVis(reduxState, 'scales.' + guide.get(type));

  return {
    legendType: type,
    scaleType: scale.get('type'),
    ...guide
  };
}

class BaseLegendInspector extends React.Component<OwnProps & StateProps> {

  public render() {
    const props = this.props;
    const handleChange = props.handleChange;
    const legendType = props.legendType;
    const scaleType = props.scaleType;
    const orientOpts = ['left', 'right'];
    const legend   = 'encode.legend.update.';
    const title  = 'encode.title.update.';
    const labels = 'encode.labels.update.';
    const grad = 'encode.gradient.update.';
    const symbols = 'encode.symbols.update.';

    const labelProperties = (
      <div className='property-group'>
        <h3>Labels</h3>

        <Property name={labels + 'fontSize.value'} label='Font Size' type='number'  onChange={handleChange} {...props} />

        <MoreProperties label='Label'>
          <Property name={labels + 'fill.value'} label='Fill' type='color'  onChange={handleChange} {...props} />
        </MoreProperties>
      </div>
    );

    return (
      <div>
        <div className='property-group'>
          <h3>Legend</h3>

          <Property name='orient' label='Orient' type='select'
            opts={orientOpts} onChange={handleChange} {...props} />

          <MoreProperties label='Legend'>
            <Property name={legend + 'stroke'} label='Color' type='color' {...props} />

            <Property name={legend + 'strokeWidth'} label='Width' type='range'
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
          </MoreProperties>
        </div>

        {(legendType === 'fill' || legendType === 'stroke') &&
            scaleType !== 'ordinal' ? (
          <div>
            {labelProperties}

            <div className='property-group'>
              {/* <h3>Gradient</h3> */}

              {/* <Property name={grad + 'height'} label="Height" type="number" onChange={handleChange} {...props} /> */}

              {/* <Property name={grad + 'width'} label="Width" type="number" onChange={handleChange} {...props} /> */}

              <MoreProperties label='Gradient' header='true'>
                <Property name={grad + 'stroke.value'} label='Color' type='color'  onChange={handleChange} {...props} />

                <Property name={grad + 'strokeWidth.value'} label='Width' type='range'
                  min='0' max='10' step='0.25'  onChange={handleChange} {...props} />
              </MoreProperties>
            </div>
          </div>
        ) : (
          <div>
            <div className='property-group'>
              <h3>Symbols</h3>

              {legendType !== 'shape' ? (
                <Property name={symbols + 'shape.value'} label='Shape'
                  type='select' opts={SymbolShapes}  onChange={handleChange} {...props} />
              ) : null}

              {legendType !== 'size' ? (
                <Property name={symbols + 'size.value'} label='Size' type='number'  onChange={handleChange} {...props} />
              ) : null}

              {legendType !== 'fill' ? (
                <Property name={symbols + 'fill.value'} label='Fill' type='color'  onChange={handleChange} {...props} />
              ) : null}

              {legendType !== 'stroke' ? (
                <Property name={symbols + 'stroke.value'} label='Stroke' type='color'  onChange={handleChange} {...props} />
              ) : null}

              <MoreProperties label='Symbol'>
                <Property name={symbols + 'fillOpacity.value'} label='Opacity'
                  type='range' min='0' max='1' step='0.05'  onChange={handleChange} {...props} />

                <Property name={symbols + 'strokeWidth.value'} label='Width'
                  type='range' min='0' max='10' step='0.25'  onChange={handleChange} {...props} />
              </MoreProperties>
            </div>

            {labelProperties}
          </div>
        )}
      </div>
    );
  }
};
export const LegendInspector = connect(mapStateToProps)(BaseLegendInspector);
