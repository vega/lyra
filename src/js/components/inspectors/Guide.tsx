'use strict';

import * as React from 'react';
import {connect} from 'react-redux';
import { Dispatch } from 'redux';
import {State} from '../../store';
import {AxisInspector} from './Axis';
import {LegendInspector} from './Legend';
import {GuideType} from '../../store/factory/Guide';
import {updateGuideProperty} from '../../actions/guideActions';
import {PrimType} from '../../constants/primTypes';

interface OwnProps {
  primType: PrimType;
  primId: number;
  guideType: GuideType;
}

interface StateProps {
  domainFields: string,
  scaleName: string
}

interface DispatchProps {
  updateGuideProperty: (guideId: number, property: string, value: any) => void;
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  const guide = state.getIn(['vis', 'present', 'guides', String(ownProps.primId)]);
  const scaleKey = ownProps.guideType === 'axis' ? 'scale' : guide.get('_type');
  const scaleId = guide.get(scaleKey);
  const scale = state.getIn(['vis', 'present', 'scales', scaleId]);

  return {
    domainFields: scale.get("_domain").map(d => d.field).join(', '),
    scaleName: scale.get("name"),
  };
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    updateGuideProperty: function(guideId, property, value) {
      dispatch(updateGuideProperty({property, value}, guideId));
    }
  };
}

class BaseGuideInspector extends React.Component<OwnProps & StateProps  & DispatchProps> {

  public handleChange(evt) {
    const guideId = this.props.primId;
    const target  = evt.target;
    const property = target.name;
    let value = (target.type === 'checkbox') ? target.checked : target.value;

    // Parse number or keep string around.
    value = value === '' || isNaN(+value) ? value : +value;
    this.props.updateGuideProperty(guideId, property, value);
  };

  public render() {
    const props = this.props;
    const guideType = props.guideType;

    const scale = props.guideType ? (
      <div className='property-group'>
        <h3 >Scale</h3>
        <div className="property">
          <div className='label-long'>{props.scaleName}</div>
          <div className='control'>{props.domainFields}</div>
        </div>
      </div>
    ) : null;

    if (guideType === GuideType.Axis) {
      return (<div className='inner'>
        {scale}
        <AxisInspector {...props} handleChange={(e) => this.handleChange(e)} />
      </div>);
    } else if (guideType === GuideType.Legend) {
      return (<div className='inner'>
        {scale}
        <LegendInspector {...props} handleChange={(e) => this.handleChange(e)} />
      </div>);
    }

    return null;
  }
};
export const GuideInspector = connect(mapStateToProps, mapDispatchToProps)(BaseGuideInspector);
