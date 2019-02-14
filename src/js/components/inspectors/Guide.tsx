'use strict';

import * as React from 'react';
import {connect} from 'react-redux';
import { Dispatch } from 'redux';
import {State} from '../../store';
import {AxisInspector} from './Axis';
import {LegendInspector} from './Legend';
import {GuideType} from '../../store/factory/Guide';
import {updateGuideProperty} from '../../actions/guideActions';

interface OwnProps {
  primType: any;
  primId: number;
  guideType: GuideType;

}

interface DispatchProps {
  updateGuideProperty: (guideId: number, property: string, value: any) => void;
}

function mapStateToProps(state: State, ownProps) {
  return {};
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
      return (<AxisInspector {...props} handleChange={this.handleChange} />);
    } else if (guideType === GuideType.Legend) {
      return (<LegendInspector {...props} handleChange={this.handleChange} />);
    }

    return null;
  }
};
export const GuideInspector = connect(mapStateToProps, mapDispatchToProps)(BaseGuideInspector);
