'use strict';
const getInVis = require('../../util/immutable-utils').getInVis;
const SHAPES = require('../../store/factory/marks/Symbol').SHAPES;

import * as React from 'react';
import {connect} from 'react-redux';
import {State} from '../../store';
import {MoreProperties} from './MoreProperties';
import {Property} from './Property';

interface OwnProps {
  primId: number;
  primType: any;
  legendType?: string;
  scaleType?: string;
  handleChange: (evt: any) => void;

}

interface StateProps {
  legendType: any;
  scaleType: any;
}

function mapStateToProps(reduxState: State, ownProps: OwnProps): StateProps {
  const guide = getInVis(reduxState, 'guides.' + ownProps.primId);
  const type  = guide.get('_type');
  const scale = getInVis(reduxState, 'scales.' + guide.get(type));

  return {
    legendType: type,
    scaleType: scale.get('type')
  };
}

class BaseLegendInspector extends React.Component<OwnProps & StateProps> {

  public render() {
    const props = this.props;
    const handleChange = props.handleChange;
    const legendType = props.legendType;
    const scaleType = props.scaleType;
    const orientOpts = ['left', 'right'];
    const legend   = 'properties.legend.';
    const title  = 'properties.title.';
    const labels = 'properties.labels.';
    const grad = 'properties.gradient.';
    const symbols = 'properties.symbols.';

    const labelProperties = (
      <div className='property-group'>
        <h3>Labels</h3>

        <Property name={labels + 'fontSize'} label='Font Size' type='number' {...props} />

        <MoreProperties label='Label'>
          <Property name={labels + 'fill'} label='Fill' type='color' {...props} />
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

          <Property name={title + 'fontSize'} label='Font Size' type='number' {...props} />

          <MoreProperties label='Title'>
            <Property name={title + 'fill'} label='Color' type='color' {...props} />
          </MoreProperties>
        </div>

        {(legendType === 'fill' || legendType === 'stroke') &&
            scaleType !== 'ordinal' ? (
          <div>
            {labelProperties}

            <div className='property-group'>
              {/* <h3>Gradient</h3> */}

              {/* <Property name={grad + 'height'} label="Height" type="number" {...props} /> */}

              {/* <Property name={grad + 'width'} label="Width" type="number" {...props} /> */}

              <MoreProperties label='Gradient' header='true'>
                <Property name={grad + 'stroke'} label='Color' type='color' {...props} />

                <Property name={grad + 'strokeWidth'} label='Width' type='range'
                  min='0' max='10' step='0.25' {...props} />
              </MoreProperties>
            </div>
          </div>
        ) : (
          <div>
            <div className='property-group'>
              <h3>Symbols</h3>

              {legendType !== 'shape' ? (
                <Property name={symbols + 'shape'} label='Shape'
                  type='select' opts={SHAPES} {...props} />
              ) : null}

              {legendType !== 'size' ? (
                <Property name={symbols + 'size'} label='Size' type='number' {...props} />
              ) : null}

              {legendType !== 'fill' ? (
                <Property name={symbols + 'fill'} label='Fill' type='color' {...props} />
              ) : null}

              {legendType !== 'stroke' ? (
                <Property name={symbols + 'stroke'} label='Stroke' type='color' {...props} />
              ) : null}

              <MoreProperties label='Symbol'>
                <Property name={symbols + 'fillOpacity'} label='Opacity'
                  type='range' min='0' max='1' step='0.05' {...props} />

                <Property name={symbols + 'strokeWidth'} label='Width'
                  type='range' min='0' max='10' step='0.25' {...props} />
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
