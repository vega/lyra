'use strict';

import * as React from 'react';
import {Map} from 'immutable';
import {connect} from 'react-redux';
import { throttle } from "throttle-debounce";
import {State} from '../../store';
import {InteractionRecord, ApplicationRecord, SelectionRecord, ScaleInfo, MarkApplicationRecord, MarkApplication} from '../../store/factory/Interaction';
import {GroupRecord} from '../../store/factory/marks/Group';
import exportName from '../../util/exportName';
import {Dispatch} from 'redux';
import {setSelection, setApplication} from '../../actions/interactionActions';
import {FormInputProperty} from './FormInputProperty';
import {MarkRecord} from '../../store/factory/Mark';
import {getScaleInfoForGroup} from '../../ctrl/demonstrations';
import {DatasetRecord} from '../../store/factory/Dataset';
import {NumericValueRef, StringValueRef} from 'vega';
import {setMarkVisual} from '../../actions/markActions';
import {Property} from './Property';

interface OwnProps {
  interactionId: number;
  groupId: number;
  markApplication: MarkApplicationRecord;
}

interface DispatchProps {
  setApplication: (record: ApplicationRecord, id: number) => void;
}

interface StateProps {
  marks: Map<string, MarkRecord>;
}


function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  const group: GroupRecord = state.getIn(['vis', 'present', 'marks', String(ownProps.groupId)]);

  const marksOfGroup = Map(group.marks.map(markId => {
    return state.getIn(['vis', 'present', 'marks', String(markId)]);
  }).filter((mark) => {
    return !(mark.type === 'group' || mark.name.indexOf('lyra') === 0);
  }).map((mark) => {
    return [exportName(mark.name), mark];
  }));

  return {
    marks: marksOfGroup
  };
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    setApplication: (def: ApplicationRecord, id: number) => {
      dispatch(setApplication(def, id));
    }
  };
}

class BaseInteractionMarkApplicationProperty extends React.Component<OwnProps & StateProps & DispatchProps> {

  constructor(props) {
    super(props);
  }

  private onDefaultValueChange(e):void {
    const value = e.target && e.target.value;
    if (value) {
      this.props.setApplication(this.props.markApplication.set('defaultValue', value), this.props.interactionId);
    }
  }

  public render() {

    // mapOptions.push(<option hidden key='_blank1' value=''>Select Channel</option>)
    // fieldOptions.push(<option key='_blank3' value='_vgsid_'>None</option>)

    const propertyName = this.props.markApplication.propertyName;
    const targetMarkName = this.props.markApplication.targetMarkName;
    const targetMark: MarkRecord = this.props.marks.filter((mark, markName) => {
      return markName === targetMarkName;
    }).valueSeq().first();
    const defaultValue = this.props.markApplication.defaultValue;

    const attributes = {
      primId: targetMark._id,
      primType: "marks" as const
    };
    switch (propertyName) {
      case 'size':
        attributes['type'] = 'number';
        attributes['min'] = '0';
        attributes['max'] = '500';
        break;
      case 'fill':
        attributes['type'] = 'color';
        break;
      case 'opacity':
        attributes['type'] = 'range';
        attributes['min'] = '0';
        attributes['max'] = '1';
        attributes['step'] = '0.05';
        break;
    }

    return (
      <div className='property-group'>
        <h3>Mark Application</h3>

        <h5>Selected {propertyName}</h5>
        <Property name={propertyName} label={propertyName} canDrop={true} {...attributes} />

        <h5>Default {propertyName}</h5>
        <Property name={'default'+propertyName} label={propertyName} onChange={(e) => this.onDefaultValueChange(e)} value={defaultValue} disabled={false} {...attributes} />
      </div>
    );
  }
};

export const InteractionMarkApplicationProperty = connect(mapStateToProps, mapDispatchToProps)(BaseInteractionMarkApplicationProperty);
