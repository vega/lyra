import * as React from 'react';
import { connect } from 'react-redux';
import {State, store} from '../../store';
import {GroupRecord} from '../../store/factory/marks/Group';
import {MarkRecord} from '../../store/factory/Mark';
import {Map} from 'immutable';
import {ColumnRecord} from '../../store/factory/Dataset';
import {Dispatch} from 'redux';
import {Interaction} from '../../store/factory/Interaction';
import {addInteractionToGroup} from '../../actions/bindChannel/helperActions';
import {addInteraction, setSelection, setMapping} from '../../actions/interactionActions';
import {QUANTITATIVE} from 'vega-lite/build/src/type';
import WidgetPanel from './WidgetPanel';
import exportName from '../../util/exportName';
import {widgetMappingPreviewDefs, getScaleInfoForGroup} from '../../ctrl/demonstrations';
import {NOMINAL} from 'vega-lite/src/type';

const dsUtil = require('../../util/dataset-utils');
export const WG_DEFAULT = '_widget_default';

interface StateProps {
  groups: number[],
  groupName: string,
  canDemonstrate: boolean
}

interface WidgetField {
  fieldDef: ColumnRecord,
  dsId: number,
  interactionId: number
}

interface OwnState{
  field: WidgetField[],
  closed: boolean[]
}

interface DispatchProps {
  addInteraction: (groupId: number) => number; // return id of newly created interaction
  setSelection: (def: any, id: number) => void;
  setMapping: (def: any, id: number) => void;
}

function mapStateToProps(state: State): StateProps {
  const marks: Map<string, MarkRecord> = state.getIn(['vis', 'present', 'marks']);
  const groups = marks.filter((mark: MarkRecord) => {
    return mark.type === 'group';
  }).valueSeq().map((x: GroupRecord) => x._id).toArray();
  const groupRecord: GroupRecord = state.getIn(['vis', 'present', 'marks', String(groups[0])]);
  const scaleInfo = getScaleInfoForGroup(state, groups[0]);
  const isParsing = state.getIn(['vega', 'isParsing']);
  const canDemonstrate = Boolean(!isParsing && ((scaleInfo.xScaleName && scaleInfo.xFieldName) || (scaleInfo.yScaleName && scaleInfo.yFieldName)));
  return {
    groups,
    groupName: exportName(groupRecord.name),
    canDemonstrate,
  };

}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    addInteraction: (groupId) => {
      const record = Interaction({
        groupId
      });
      const addAction = addInteraction(record);
      dispatch(addAction);
      dispatch(addInteractionToGroup(addAction.meta, groupId));
      return addAction.meta;
    },
    setSelection: (def: any, id: number) => {
      dispatch(setSelection(def, id));
    },
    setMapping: (def: any, id: number) => {
      dispatch(setMapping(def, id));
    },
  };
}

function generateSignals(fieldDef, dsId) {
  let signals = [];
  const name = fieldDef.name;
  if(fieldDef.mtype === QUANTITATIVE) {
    const {max, min, mid, quart1, quart2, length} = dsUtil.widgetParams(fieldDef, dsId, QUANTITATIVE);
    signals.push({name: name+WG_DEFAULT, init: mid, bind: {name, input: 'range', min, max, step: Math.floor((max-min)/length)}});
    signals.push({name: name+'1', init: mid, bind: {name, element: '.'+name+1, input: 'range', min, max, step: Math.floor((max-min)/length)}});
    signals.push({name: name+'2', bind:{name, input: 'select', element: '.'+name+2, options:[min, quart1, mid, quart2, max]}});
    signals.push({name: name+'3', bind:{name, input: 'radio', element: '.'+name+3, options:[min, quart1, mid, quart2, max]}});
    signals.push({name: name+'4', init: mid, bind:{name, input: 'text', element: '.'+name+4}});
    return signals;
  } else {
    const {options} = dsUtil.widgetParams(fieldDef, dsId, NOMINAL);
    console.log('op', options);
    signals.push({name: name+WG_DEFAULT, init: [options[0]], bind:{name, input: 'select', options}});
    signals.push({name: name+'1', bind:{name, input: 'select', element: '.'+name+1, options}});
    signals.push({name: name+'2', bind:{name, input: 'select', element: '.'+name+2, options}});
    signals.push({name: name+'3', bind:{name, input: 'select', element: '.'+name+3, options}});
    signals.push({name: name+'4', init: [options[0]], bind:{name, input: 'text', element: '.'+name+4}});
  }

  return signals;
}

class InteractionWidget extends React.Component<StateProps & DispatchProps, OwnState> {

  constructor(props) {
    super(props);
    this.state = {
      field: [],
      closed: []
    }
  }

  // public componentDidUpdate(prevProps: StateProps, prevState) {
  // }

  public handleDrop = (evt)  => {
    const dt = evt.dataTransfer;
    const dsId = dt.getData('dsId');
    const fieldDefn = JSON.parse(dt.getData('fieldDef'));
    const fieldObj = this.state.field.filter(e => e.dsId===dsId && e.fieldDef.name === fieldDefn.name);

    if(!fieldObj.length) {
      let panelState = this.state.closed.map(e => true).concat(false);
      const interactionId = this.props.addInteraction(this.props.groups[0]); // On Which group to add interaction?
      this.setState(prevState => ({
        field: [...prevState.field, {fieldDef: fieldDefn, dsId, interactionId}],
        closed: panelState
      }));

      this.props.setSelection({
        id: 'widget_'+fieldDefn.name,
        label: 'Widget',
        field: fieldDefn.name,
        signals: generateSignals(fieldDefn, dsId),
      }, interactionId)
      const defs= widgetMappingPreviewDefs(fieldDefn.name, this.props.groupName, '<=');
      this.props.setMapping(defs[1], interactionId);
    }
  };

  public managePane = (t: boolean, i: number) => {
    const arr = this.state.closed;
    arr[i] = t;
    this.setState({closed: arr});
  };
  public handleDragOver = (evt) => {
    if (evt.preventDefault) {
      evt.preventDefault(); // Necessary. Allows us to drop.
    }
  };
  public render() {

    const widgetFields = this.state.field.map((e, i)=>
      <span onClick={() => this.managePane(false, i)} key={e.fieldDef.name}>{e.fieldDef.name + " "}</span>
    )

    const widgetPanels = this.state.field.map((e, i) =>
      <WidgetPanel
        id={e.interactionId}
        managePane={t => this.managePane(t, i)}
        key={e.interactionId}
        closed={this.state.closed[i]}
        name={e.fieldDef.name}>
      </WidgetPanel>
    );

    return (
      <React.Fragment>
        <div className={this.props.canDemonstrate ? 'interaction-widget':'hidden' } onDragOver={this.handleDragOver} onDrop={this.handleDrop}>
          {this.state.field.length ? widgetFields : null}
          <div><i>Drop a field to add a widget</i></div>
        </div>
        {this.state.field.length ? widgetPanels : null}
      </React.Fragment>
    )
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(InteractionWidget);