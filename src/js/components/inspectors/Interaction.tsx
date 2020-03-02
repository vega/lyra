'use strict';

import * as React from 'react';
import {connect} from 'react-redux';
import { throttle } from "throttle-debounce";
import {State} from '../../store';
import {InteractionRecord, ApplicationRecord, SelectionRecord, ScaleInfo, MarkApplicationRecord} from '../../store/factory/Interaction';
import {GroupRecord} from '../../store/factory/marks/Group';
import {Dispatch} from 'redux';
import {setSelection, setApplication} from '../../actions/interactionActions';
import {FormInputProperty} from './FormInputProperty';
import {getScaleInfoForGroup} from '../../ctrl/demonstrations';
import {DatasetRecord} from '../../store/factory/Dataset';
import {InteractionMarkApplicationProperty} from './InteractionMarkApplication';
import {MarkRecord} from '../../store/factory/Mark';

interface OwnProps {
  primId: number;
}

interface OwnState {
  // size: number;
  // color: string;
  // opacity: number;
}

interface DispatchProps {
  setSelection: (record: SelectionRecord, id: number) => void;
  setMapping: (record: ApplicationRecord, id: number) => void;
}

interface StateProps {
  interaction: InteractionRecord;
  scaleInfo: ScaleInfo;
  group: GroupRecord;
  marksOfGroup: MarkRecord[];
  fieldsOfGroup: string[];
  // type: string;
}


function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  const interaction = state.getIn(['vis', 'present', 'interactions',  String(ownProps.primId)]);
  const groupId = interaction.get('groupId');
  const scaleInfo: ScaleInfo = getScaleInfoForGroup(state, groupId);
  const group: GroupRecord = state.getIn(['vis', 'present', 'marks', String(groupId)]);
  // marksOfGroup: MarkRecord[], scaleInfo: ScaleInfo, fieldsOfGroup: string[]

  const marksOfGroup = group.marks.map(markId => {
      return state.getIn(['vis', 'present', 'marks', String(markId)]);
    }).filter((mark) => {
      return !(mark.type === 'group' || mark.name.indexOf('lyra') === 0);
    });

  const datasets: Map<string, DatasetRecord> = state.getIn(['vis', 'present', 'datasets']);

  let fieldsOfGroup = [];
  if (marksOfGroup.length && marksOfGroup[0].from && marksOfGroup[0].from.data) {
    const dsId = String(marksOfGroup[0].from.data);
    const dataset: DatasetRecord =  datasets.get(dsId);
    const schema = dataset.get('_schema');
    const fields = schema.keySeq().toArray();
    fieldsOfGroup = fields;
  }

  return {
    interaction,
    scaleInfo,
    group,
    marksOfGroup,
    fieldsOfGroup,
    // type,
  };
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    setSelection: (def: SelectionRecord, id: number) => {
      dispatch(setSelection(def, id));
    },
    setMapping: (def: ApplicationRecord, id: number) => {
      dispatch(setApplication(def, id));
    }
  };
}

class BaseInteractionInspector extends React.Component<OwnProps & StateProps & DispatchProps, OwnState> {

  constructor(props) {
    super(props);
  }

  public render() {

    // mapOptions.push(<option hidden key='_blank1' value=''>Select Channel</option>)
    // fieldOptions.push(<option key='_blank3' value='_vgsid_'>None</option>)

    const interaction = this.props.interaction;
    const selection = interaction.selection;
    const application = interaction.application;

    return (
      <div>
        <div className='property-group'>
          <h3 className='label'>Interaction</h3>
          <ul>
            <li>Name: {interaction.get('name')}</li>
            <li>Selection: {selection ? selection.label : 'None'}</li>
            <li>Application: {application ? application.label : 'None'}</li>
          </ul>
        </div>

        <div className='property-group'>
          <h3 className='label'>Selection</h3>
          <ul>
            <li>Field: {selection && selection.field !== '_vgsid_' ? selection.field : 'id'}</li>
          </ul>
        </div>

        {
          application && application.type === 'mark' ? <InteractionMarkApplicationProperty interactionId={interaction.id} groupId={interaction.groupId} markApplication={applicationDef as MarkApplicationRecord}></InteractionMarkApplicationProperty> : null
        }

{/*
        <div className='property-group'>
          <h3 className='label'>Settings</h3>
          <ul>
            Selection :
            <select value={selectionDef ? selectionDef.id : ''} onChange={e => this.handleSelectionChange(e.target.value)}>
              {
                this.props.selections.map(selection => {
                  return <option key={selection.id} value={selection.id}>{selection.label}</option>
                })
              }
            </select>
          </ul>

          <ul>
            Application :
            <select value={applicationDef ? applicationDef.id : ''} onChange={e => this.handleApplicationChange(e.target.value)}>
              {
                this.props.applications.map(application => {
                  return <option key={application.id} value={application.id}>{application.label}</option>
                })
              }
            </select>
          </ul>
        </div>

        {
          applicationDef.type === 'mark' ? <InteractionMarkApplicationProperty groupId={interaction.groupId} markApplication={applicationDef as MarkApplicationRecord}></InteractionMarkApplicationProperty> : null
        } */}

      </div>
    );
  }
};

export const InteractionInspector = connect(mapStateToProps, mapDispatchToProps)(BaseInteractionInspector);
