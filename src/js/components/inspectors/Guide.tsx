'use strict';
const getInVis = require('../../util/immutable-utils').getInVis;

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
  scaleType?: string;
}

interface DispatchProps {
  updateGuideProperty: (guideId: number, property: string, value: any) => void;
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  const guide = getInVis(state, 'guides.' + ownProps.primId);
  const scaleKey = ownProps.guideType === 'axis' ? 'scale' : guide.get('_type');
  const scaleId = guide.get(scaleKey);
  const scale = getInVis(state, 'scales.' + scaleId);

  return {
    ...guide.toJSON()
  };
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    updateGuideProperty: function(guideId, property, value) {
      dispatch(updateGuideProperty({property, value}, guideId));
    }
  };
}

class BaseGuideInspector extends React.Component<OwnProps & DispatchProps> {

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

    if (guideType === GuideType.Axis) {
      return (<AxisInspector {...props} handleChange={(e) => this.handleChange(e)} />);
    } else if (guideType === GuideType.Legend) {
      return (<LegendInspector {...props} handleChange={(e) => this.handleChange(e)} />);
    }

    return null;
  }
};
export const GuideInspector = connect(mapStateToProps, mapDispatchToProps)(BaseGuideInspector);
