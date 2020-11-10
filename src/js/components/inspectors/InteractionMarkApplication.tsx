'use strict';

import * as React from 'react';
import {Map} from 'immutable';
import {connect} from 'react-redux';
import {State} from '../../store';
import {ApplicationRecord, MarkApplicationRecord, MarkApplication, InteractionRecord} from '../../store/factory/Interaction';
import {GroupRecord} from '../../store/factory/marks/Group';
import exportName from '../../util/exportName';
import {Dispatch} from 'redux';
import {setApplication} from '../../actions/interactionActions';
import {MarkRecord} from '../../store/factory/Mark';
import {Property} from './Property';
import {getNestedMarksOfGroup} from '../../ctrl/demonstrations';

interface OwnProps {
  interactionId: number;
  markApplication: MarkApplicationRecord;
}

interface DispatchProps {
  setApplication: (record: ApplicationRecord, id: number) => void;
}

interface StateProps {
  targetMark: MarkRecord;
}


function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  const marks: Map<string, MarkRecord> = state.getIn(['vis', 'present', 'marks']);
  let targetGroupName = exportName(ownProps.markApplication.targetGroupName);
  if (!targetGroupName) {
    // TODO(jzong) this extra stuff is so that we don't have to regenerate everyone's json before the paper deadline
    // delete this later
    const interaction: InteractionRecord = state.getIn(['vis', 'present', 'interactions', String(ownProps.interactionId)]);
    const groupId = interaction.groupId;
    const group = marks.get(String(groupId));
    targetGroupName = exportName(group.name);
  }
  const targetGroup = marks.find(mark => exportName(mark.name) === targetGroupName) as GroupRecord;

  const targetMark = getNestedMarksOfGroup(state, targetGroup).find((mark => {
    return exportName(mark.name) === ownProps.markApplication.targetMarkName;
  }));

  return {
      targetMark
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
    const targetMark = this.props.targetMark;
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
      case 'stroke':
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
