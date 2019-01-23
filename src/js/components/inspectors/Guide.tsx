'use strict';

const dl = require('datalib');
const GTYPES = require('../../store/factory/Guide').GTYPES;
const updateGuideProperty = require('../../actions/guideActions').updateGuideProperty;
const AxisInspector = require('./Axis');
const LegendInspector = require('./Legend');

import * as React from 'react';
import {connect} from 'react-redux';
import { Dispatch } from 'redux';
import {State} from '../../store';

function mapStateToProps(state: State, ownProps) {
  return {};
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    updateGuideProperty: function(guideId, property, value) {
      dispatch(updateGuideProperty(guideId, property, value));
    }
  };
}

interface GuideInspectorProps {
  primId: number;
  guideType: any; // propTypes.oneOf(dl.vals(GTYPES))
  updateGuideProperty: (guideId: any, property: any, value: any) => any;
}

class BaseGuideInspector extends React.Component<GuideInspectorProps> {

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

    if (guideType === GTYPES.AXIS) {
      return (<AxisInspector {...props} handleChange={this.handleChange} />);
    } else if (guideType === GTYPES.LEGEND) {
      return (<LegendInspector {...props} handleChange={this.handleChange} />);
    }

    return null;
  }
};
export const GuideInspector = connect(mapStateToProps, mapDispatchToProps)(BaseGuideInspector);
