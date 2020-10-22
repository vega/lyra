'use strict';

const getInVis = require('../../util/immutable-utils').getInVis;

import * as React from 'react';
import {connect} from 'react-redux';
import {State} from '../../store';
import { Dispatch } from 'redux';
import {PrimType} from '../../constants/primTypes';
import {Property} from './Property';
import { MoreProperties } from './MoreProperties';
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
    const scaleId = this.props.primId;
    const target = evt.target;
    const property = target.name;

    let value = (target.type === 'checkbox') ? target.checked : target.value;;

    if (typeof (value) !== 'boolean' && value !== '' && !isNaN(+value)) {
      // Parse number or keep string around.
      value =  +value;
    }

    this.props.updateScaleProperty(scaleId, property, value);
  };

  public filterOpts(opts, scaleName) {
    if (scaleName.slice(0,1) === "y"){
      return opts.filter(opt => opt === 'height');
    } else if (scaleName.slice(0,1) === "x" || scaleName.slice(0,4) == "size") {
      return opts.filter(opt => opt === 'width');
    }
    return opts;
  }

  public render() {
    const props = this.props;
    const scale = props.scale;
    const typeOpts = ['linear', 'log', 'time', 'ordinal', 'band', 'point'];
    const rangeOpts = ['width', 'height', 'symbol', 'category', 'diverging', 'ordinal', 'ramp', 'heatmap'];
    const rangeColorCategoryOpts = ['tableau10', 'category10', 'category20', 'tableau20'];
    const rangeColorSequentialOpts = ['blues', 'greens', 'oranges', 'reds', 'purples'];
    const rangeColorDivergingOpts = ['blueorange', 'redblue', 'spectral'];
    const scaleName = scale.get('name');
    const scaleType = scale.get('type');
    return (
      <div>
        <div className='property-group'>
          <h3>Type</h3>
          <Property name='type' label='Type' type='select' opts={typeOpts} onChange={(e) => this.handleChange(e)} {...props} />
          <Property name='clamp' label='Clamp' type='checkbox' onChange={(e) => this.handleChange(e)} {...props} />
          <Property name='nice' label='Nice' type='checkbox' onChange={(e) => this.handleChange(e)} {...props} />
          <Property name='zero' label='Zero' type='checkbox' onChange={(e) => this.handleChange(e)} {...props} />
          <Property name='reverse' label='Reverse' type='checkbox' onChange={(e) => this.handleChange(e)} {...props} />
          <Property name='round' label='Round' type='checkbox' onChange={(e) => this.handleChange(e)} {...props} />
        </div>
        <div className='property-group'>
          <h3>Domain</h3>
          <div className="property">
            <div className='label'>Domain Field</div>
            <div className='control'>{scale.getIn(['_domain', 0, 'field'])}</div>
          </div>
          {(scaleType === 'linear' || scaleType === 'log' || scaleType === 'time') &&
            <div>
              <Property name='domainMin' label='Domain Min' type='number' onChange={(e) => this.handleChange(e)} {...props} />
              <Property name='domainMax' label='Domain Max' type='number' onChange={(e) => this.handleChange(e)} {...props} />
            </div>
          }
        </div>
        <div className='property-group'>
          <h3>Range</h3>
          {scaleName.slice(0,5) === "color" ?
            <Property name='range.scheme' label='Range' type='select'
              opts={rangeColorCategoryOpts.concat(rangeColorSequentialOpts).concat(rangeColorDivergingOpts)}
              onChange={(e) => this.handleChange(e)} {...props} />
            :
            <Property name='range' label='Range' type='select' opts={this.filterOpts(rangeOpts, scaleName)}
            onChange={(e) => this.handleChange(e)} {...props} />
          }
        </div>
        <div className='property-group'>
          <h3>Padding</h3>
          <Property name='padding' label='Padding' type='number' onChange={(e) => this.handleChange(e)} {...props} />
          {(scaleType === 'band') &&
            <div>
            <MoreProperties label='Scale'>
              <Property name='paddingInner' label='Padding Inner' type='number' onChange={(e) => this.handleChange(e)} {...props} />
              <Property name='paddingOuter' label='Padding Outer' type='number' onChange={(e) => this.handleChange(e)} {...props} />
              <Property name='align' label='Align' type='number' onChange={(e) => this.handleChange(e)} {...props} />
            </MoreProperties>
            </div>
          }
        </div>
      </div>
    );
  }
};

export const ScaleInspector = connect(mapStateToProps, mapDispatchToProps)(BaseScaleInspector);
