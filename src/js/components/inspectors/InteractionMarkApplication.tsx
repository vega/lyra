'use strict';

import * as React from 'react';
import {Map} from 'immutable';
import {connect} from 'react-redux';
import {State} from '../../store';
import {ApplicationRecord, MarkApplicationRecord} from '../../store/factory/Interaction';
import {GroupRecord} from '../../store/factory/marks/Group';
import exportName from '../../util/exportName';
import {Dispatch} from 'redux';
import {setApplication} from '../../actions/interactionActions';
import {MarkRecord} from '../../store/factory/Mark';
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

  private onUnselectedValueChange(e):void {
    const value = e.target && e.target.value;
    if (value) {
      this.props.setApplication(this.props.markApplication.set('unselectedValue', value), this.props.interactionId);
    }
  }

  public render() {

    const propertyName = this.props.markApplication.propertyName;
    const targetMarkName = this.props.markApplication.targetMarkName;
    const targetMark: MarkRecord = this.props.marks.filter((mark, markName) => {
      return markName === targetMarkName;
    }).valueSeq().first();
    const unselectedValue = this.props.markApplication.unselectedValue;

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
      <div>
        <Property name={propertyName} label={'Selected ' + propertyName} droppable={true} {...attributes} />

        <Property name={'unselected'+propertyName} label={'Unselected ' + propertyName} onChange={(e) => this.onUnselectedValueChange(e)} value={unselectedValue} disabled={false} {...attributes} />
      </div>
    );
  }
};

export const InteractionMarkApplicationProperty = connect(mapStateToProps, mapDispatchToProps)(BaseInteractionMarkApplicationProperty);
