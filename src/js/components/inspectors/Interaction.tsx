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

function updateVal(field: string) {
  return `datum && !datum.manipulator && item().mark.marktype !== 'group' ? {unit: \"layer_0\", fields: points_tuple_fields, values: [(item().isVoronoi ? datum.datum : datum)['${field ? field : '_vgsid_'}']]} : null`
}
class BaseInteractionInspector extends React.Component<OwnProps & StateProps & DispatchProps, OwnState> {
  [x: string]: any;
  constructor(props) {
    super(props);

    this.state = {
      size: 100,
      color: '#666666',
      opacity: 0.2
    }
    this.handleApplicationChange = this.handleApplicationChange.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.handlePropertyChangeThrottled = throttle(500, this.handlePropertyChange);
  }

  // componentWillMount() {
  //   const name = 'lyra_interaction_' + this.props.primId + '_size';
  //   this.props.initSignal(name, 100);
  // }

  public handleApplicationChange(value) {
    if(this.props.type == 'widget') {
      const fieldName = this.props.interaction.selection.field;
      const previousApplicationDef = this.props.interaction.application;
      const defs = widgetApplicationPreviewDefs(fieldName, previousApplicationDef.groupName, previousApplicationDef.comparator);
      const def = defs.filter(e => e.id === value);
      this.props.setMapping(def[0], this.props.interaction.id);
    } else {
      const preview = this.props.applicationDefs.filter(e => e.id === value);
      if(preview.length) {
        if (this.props.interaction.application && this.props.interaction.application.id === preview[0].id) {
          this.props.setMapping(null, this.props.interaction.id);
        }
        else {
          if (!this.props.interaction.selection) {
            this.props.setSelection(this.props.selectionDefs[0], this.props.interaction.id);
          }
          this.props.setMapping(preview[0], this.props.interaction.id);
        }
      }
    }
    this.handlePropertyChange();
  }


  public handleSelectionChange(value) {
    const preview = this.props.selectionDefs.filter(e => e.id === value);
    if(preview.length) {
      if (this.props.interaction.selection && this.props.interaction.selection.id === preview[0].id) {
        this.props.setSelection(null, this.props.interaction.id);

      }
      else {
        const fieldPresent = this.props.interaction.selection && this.props.interaction.selection.field ? true: false;
        this.props.setSelection(preview[0], this.props.interaction.id);
        if(fieldPresent) {
          this.handleFieldChange(this.props.interaction.selection.field, preview[0]);
        }
      }
    }
  }

  public handleFieldChange(field, def=this.props.interaction.selection) {
    const currentDef = JSON.parse(JSON.stringify(def));
    if(currentDef && currentDef.signals.length) {
      currentDef.signals[0].on[0]['update'] = updateVal(field);
      currentDef.signals[1]['value'][0].field = field;
      currentDef.field = field;
      this.props.setSelection(currentDef, this.props.interaction.id);
    }
  }

  public handlePropertyChange() {
    if(!this.props.interaction.application) this.handleApplicationChange('color');
    const {markPropertyValues} = this.props.interaction
    const id = this.props.interaction.application.id;
    const update = this.props.interaction.application.markProperties.encode.update;
    if(id == 'color' && update.fill[1].value != markPropertyValues.color) {
      this.props.setValueInMark({property: 'fill', value: markPropertyValues.color}, this.props.interaction.id);
    } else if (id == 'opacity' && update.fillOpacity[1].value != markPropertyValues.opacity) {
      this.props.setValueInMark({property: 'fillOpacity', value: markPropertyValues.opacity}, this.props.interaction.id);
    } else if (id == 'size' && update.size[1].value != markPropertyValues.size) {
      this.props.setValueInMark({property: 'size', value: markPropertyValues.size}, this.props.interaction.id);
    }

  }

  public onPropertyChange(e, field):void {
    const value = e.target && e.target.value;
    if(value) {
      this.props.setMarkPropertyValue({property: field, value}, this.props.interaction.id);
      this.handlePropertyChangeThrottled();
    }
  }

  public render() {

    // mapOptions.push(<option hidden key='_blank1' value=''>Select Channel</option>)
    // fieldOptions.push(<option key='_blank3' value='_vgsid_'>None</option>)

    const interaction = this.props.interaction;
    const selectionDef = interaction.selection;
    const applicationDef = interaction.application;

    return (
      <div>
        <div className='property-group'>
          <h3 className='label'>Interaction</h3>
          <ul>
            <li>Name: {interaction.get('name')}</li>
            <li>Selection: {selectionDef ? selectionDef.label : 'None'}</li>
            <li>Application: {applicationDef ? applicationDef.label : 'None'}</li>
          </ul>
        </div>

        <div className='property-group'>
          <h3 className='label'>Selection</h3>
          <ul>
            <li>Field: </li>
          </ul>
        </div>

        {
          applicationDef && applicationDef.type === 'mark' ? <InteractionMarkApplicationProperty interactionId={interaction.id} groupId={interaction.groupId} markApplication={applicationDef as MarkApplicationRecord}></InteractionMarkApplicationProperty> : null
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
