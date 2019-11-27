'use strict';

import * as React from 'react';
import {connect} from 'react-redux';
import {State} from '../../store';
import {InteractionRecord, Interaction} from '../../store/factory/Interaction';
import {Property} from './Property';
import {ScaleInfo, LyraMappingPreviewDef, LyraSelectionPreviewDef} from '../interactions/InteractionPreviewController';
import {mappingPreviewDefs, getScaleInfoForGroup, selectionPreviewDefs} from '../../ctrl/demonstrations';
import {GroupRecord} from '../../store/factory/marks/Group';
import exportName from '../../util/exportName';
import {Dispatch} from 'redux';
import {setSelection, setMapping} from '../../actions/interactionActions';

const ctrl = require('../../ctrl');
const getInVis = require('../../util/immutable-utils').getInVis;

interface OwnProps {
  primId: number;
}

interface OwnState {
  value: string;
}

interface DispatchProps {
  setSelection: (def: any, id: number) => void;
  setMapping: (def: any, id: number) => void;
}

interface StateProps {
  interaction: InteractionRecord;
  mappingDefs: LyraMappingPreviewDef[];
  selectionDefs: LyraSelectionPreviewDef[];
  mappingOptions: string[];
  selectionOptions: string[];
  fields: string[];
  isPoint: boolean;
}


function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  const interaction = state.getIn(['vis', 'present', 'interactions',  String(ownProps.primId)]);
  const groupId = interaction.get('groupId');
  const scaleInfo: ScaleInfo = getScaleInfoForGroup(state, groupId);
  const groupRecord: GroupRecord = state.getIn(['vis', 'present', 'marks', String(groupId)]);
  const isInterval = interaction.selectionDef && interaction.selectionDef.id.startsWith('brush') ? true : false;
  const isPoint = !isInterval;

  const field = interaction.selectionDef && interaction.selectionDef.field;
  const marksOfGroup = groupRecord.marks.map((markId) => {
    return state.getIn(['vis', 'present', 'marks', String(markId)]).toJS();
  }).filter((mark) => {
    return !(mark.type === 'group' || mark.name.indexOf('lyra') === 0);
  });
  const mappingDefs =  mappingPreviewDefs(isInterval, marksOfGroup, scaleInfo, exportName(groupRecord.name), ctrl.export());
  const mappingOptions = mappingDefs.map(e => e.id);
  const selectionDefs = selectionPreviewDefs(true, true, marksOfGroup, scaleInfo, field);
  const selectionOptions = selectionDefs.map(e => e.id);

  const dsId = marksOfGroup[0].from.data;
  const dataset =  getInVis(state, 'datasets.' + dsId);
  const schema = dataset.get('_schema');
  const fields = schema.keySeq().toArray();

  return {
    interaction,
    mappingDefs,
    mappingOptions,
    selectionDefs,
    selectionOptions,
    fields,
    isPoint,
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps): DispatchProps {
  return {
    setSelection: (def: any, id: number) => {
      dispatch(setSelection(def, id));
    },
    setMapping: (def: any, id: number) => {
      dispatch(setMapping(def, id));
    }
  };
}

export function updateVal(field: string) {
  return `datum && !datum.manipulator && item().mark.marktype !== 'group' ? {unit: \"layer_0\", fields: points_tuple_fields, values: [(item().isVoronoi ? datum.datum : datum)['${field ? field : '_vgsid_'}']]} : null`
}
class BaseInteractionInspector extends React.Component<OwnProps & StateProps & DispatchProps, OwnState> {
  constructor(props) {
    super(props);

    this.state = {
      value: null
    }
    this.handleMapChange = this.handleMapChange.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
  }

  public handleMapChange(event) {
    const preview = this.props.mappingDefs.filter(e => e.id === event.target.value);
    if(preview.length) {
      if (this.props.interaction.mappingDef && this.props.interaction.mappingDef.id === preview[0].id) {
        this.props.setMapping(null, this.props.interaction.id);
      }
      else {
        if (!this.props.interaction.selectionDef) {
          this.props.setSelection(this.props.selectionDefs[0], this.props.interaction.id);
        }
        this.props.setMapping(preview[0], this.props.interaction.id);
      }
    }
  }


  public handleSelectionChange(event) {
    const preview = this.props.selectionDefs.filter(e => e.id === event.target.value);
    if(preview.length) {
      if (this.props.interaction.selectionDef && this.props.interaction.selectionDef.id === preview[0].id) {
        this.props.setSelection(null, this.props.interaction.id);

      }
      else {
        console.log(this.props.interaction.selectionDef);
        const fieldPresent = this.props.interaction.selectionDef && this.props.interaction.selectionDef.field ? true: false;
        this.props.setSelection(preview[0], this.props.interaction.id);
        if(fieldPresent) {
          this.handleFieldChange(this.props.interaction.selectionDef.field, preview[0]);
        }
      }
    }
  }

  public handleFieldChange(field, def=this.props.interaction.selectionDef) {
    const currentDef = JSON.parse(JSON.stringify(def));
    if(currentDef && currentDef.signals.length) {
      currentDef.signals[0].on[0]['update'] = updateVal(field);
      currentDef.signals[1]['value'][0].field = field;
      currentDef.field = field;
      this.props.setSelection(currentDef, this.props.interaction.id);
    }
  }

  public render() {
    let mapOptions = this.props.mappingOptions.map(e=> {
      return <option key={e} value={e}>{e}</option>
    });
    mapOptions.push(<option hidden key='_blank1' value=''>Select Channel</option>)

    let selectionOptions = this.props.selectionOptions.map(e=> {
      return <option key={e} value={e}>{e}</option>
    });
    mapOptions.push(<option hidden key='_blank2' value=''>Select Type</option>)

    let fieldOptions = this.props.fields.map(e => {
      return <option key={e} value={e}>{e}</option>
    });
    fieldOptions.push(<option key='_blank2' value='_vgsid_'>None</option>)

    const props = this.props;
    const interaction = this.props.interaction;
    const selectionDef = interaction.get('selectionDef');
    const mappingDef = interaction.get('mappingDef');
    return (
      <div>
        <div className='property-group'>
          <h3 className='label'>Placeholder</h3>
          <ul>
            <li>Name: {interaction.get('name')}</li>
            <li>Selection: {selectionDef ? selectionDef.label : ''}</li>
            <li>Mapping: {mappingDef ? mappingDef.label : ''}</li>
          </ul>
        </div>

        <div className='property-group'>
          <h3 className='label'>Settings</h3>
          <ul>
          Selection :
          <select value={selectionDef ? selectionDef.id : ''} onChange={e => this.handleSelectionChange(e)}>
            {selectionOptions}
          </select>
          </ul>

          <ul>
          Channel :
          <select value={mappingDef ? mappingDef.id : ''} onChange={e => this.handleMapChange(e)}>
            {mapOptions}
          </select>
          </ul>

          <ul className={this.props.isPoint ? '': 'hidden'}>
          Project On :
          <select value={selectionDef ? selectionDef.field : '_vgsid_'} onChange={e => this.handleFieldChange(e.target.value)}>
            {fieldOptions}
          </select>
          </ul>
        </div>
        <Property name='size' label='Size' type='number' canDrop={true} {...props} />


      </div>
    );
  }
};

export const InteractionInspector = connect(mapStateToProps, mapDispatchToProps)(BaseInteractionInspector);
