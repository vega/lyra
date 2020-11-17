'use strict';

import * as React from 'react';
import {connect} from 'react-redux';
import {State} from '../../store';
import { Dispatch } from 'redux';
import {PrimType} from '../../constants/primTypes';
import {Property} from './Property';
import { MoreProperties } from './MoreProperties';
import { MultiValueProperty } from './MultiValueProperty';
import {ScaleRecord} from '../../store/factory/Scale';
import { updateScaleProperty } from '../../actions/scaleActions';
import { ScaleSimpleType, scaleTypeSimple} from '../../store/factory/Scale';

interface OwnProps {
  primId: number;
  primType: PrimType;
}

interface StateProps {
  scale: ScaleRecord;
  fields: string[];
  fieldMap: Map<string, string[]>;
}

interface DispatchProps {
  updateScaleProperty: (scaleId: number, property: string, value: any) => void;
}


function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  let scale = state.getIn(['vis', 'present', 'scales', String(ownProps.primId)]);
  let scaleDomain = scale.get("_domain");
  let currentFields = scaleDomain.map((domain) => domain.field);
  let dataIds, fields = [''], fieldMap = new Map();
  [...dataIds] = state.getIn(['vis', 'present', 'datasets']).keys();
  dataIds.forEach((dataId) => {
    let fieldVal = state.getIn(['vis', 'present', 'datasets', String(dataId), '_schema']).keySeq().toJS();
    fields = fields.concat(fieldVal);
    fieldMap.set(dataId, fieldVal);
  });
  fields = fields.filter((field) => !currentFields.includes(field));
  return {
      scale,
      fields,
      fieldMap
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

  public handleChange(evt, arrayValues?) {
    // Skip none ENTER key events
    if ((evt.key && evt.key !== 'Enter') || (evt.keyCode && evt.keyCode !== 13)) {
      return;
    }

    const scaleId = this.props.primId;
    const target = evt.target;
    const property = target.name;

    let value = (target.type === 'checkbox') ? target.checked : arrayValues ? arrayValues :  target.value;

    if (typeof (value) !== 'boolean' && value !== '' && !isNaN(+value) && !Array.isArray(value)) {
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

  public processValue(value, props) {
    if (props.name === '_domain' && props.type === 'select') {
      let dataId;
      props.fieldMap.forEach((val, key) => { // This will match the last dataset that has the field
        dataId = val.includes(value) ? key : null;
      });
      return { data: Number(dataId), field: value };
    } else {
      return value;
    }
  };

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
    const isScaleManual = scale.get('_manual');
    return (
      <div>
        <div className='property-group'>
          <h3>Type</h3>
          <Property name='type' label='Type' type='select' opts={typeOpts.filter(opt => {return scaleTypeSimple(opt) === scaleTypeSimple(scaleType)})} onChange={(e) => this.handleChange(e)} {...props} />
          <Property name='clamp' label='Clamp' type='checkbox' onChange={(e) => this.handleChange(e)} {...props} />
          <Property name='nice' label='Nice' type='checkbox' onChange={(e) => this.handleChange(e)} {...props} />
          <Property name='zero' label='Zero' type='checkbox' onChange={(e) => this.handleChange(e)} {...props} />
          <Property name='reverse' label='Reverse' type='checkbox' onChange={(e) => this.handleChange(e)} {...props} />
          <Property name='round' label='Round' type='checkbox' onChange={(e) => this.handleChange(e)} {...props} />
        </div>
        <div className='property-group'>
          <div>
            <h3>Domain </h3>
            <Property name='_manual' label='Manual' type='checkbox' onChange={(e) => this.handleChange(e)} {...props} />
          </div>
          {(!isScaleManual) &&
            <MultiValueProperty name='_domain' label='Fields' type='select' subLabel='field' onChange={(e, arrVals) => this.handleChange(e, arrVals)} opts={props.fields} valueProperty='field' processValue={(value, props) => this.processValue(value, props)} {...props} />
          }
          {scaleTypeSimple(scaleType) === ScaleSimpleType.CONTINUOUS && isScaleManual &&
            <div>
              <Property name='domainMin' label='Domain Min' type='number' onChange={(e) => this.handleChange(e)} {...props} />
              <Property name='domainMax' label='Domain Max' type='number' onChange={(e) => this.handleChange(e)} {...props} />
            </div>
          }
          {scaleTypeSimple(scaleType) === ScaleSimpleType.DISCRETE && isScaleManual &&
            <div>
            <MultiValueProperty name='_manualDomain' label='Values' type='text' onKeyPress={(e, arrVals) => this.handleChange(e, arrVals)} {...props} />
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
