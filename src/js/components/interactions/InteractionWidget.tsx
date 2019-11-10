import * as React from 'react';
import { connect } from 'react-redux';
import {State, store} from '../../store';
import {GroupRecord} from '../../store/factory/marks/Group';
import {MarkRecord} from '../../store/factory/Mark';
import {Map} from 'immutable';
import {fieldDefs} from 'vega-lite/src/encoding';
import {ColumnRecord} from '../../store/factory/Dataset';
import {Dispatch} from 'redux';
import {Interaction, LyraInteractionType} from '../../store/factory/Interaction';
import {addInteractionToGroup} from '../../actions/bindChannel/helperActions';
import {addInteraction} from '../../actions/interactionActions';
import {setInteractionType, addWidgetSignals} from '../../actions/interactionActions';
import {Signal} from 'vega';
import {QUANTITATIVE} from 'vega-lite/build/src/type';


const ctrl = require('../../ctrl');
const dsUtil = require('../../util/dataset-utils');
const getInVis = require('../../util/immutable-utils').getInVis;

interface StateProps {
  groups: number[],
}

interface WidgetField {
  fieldDef: ColumnRecord,
  id: number,
}

interface OwnState{
  field: WidgetField[],
  closed: boolean
}

interface DispatchProps {
  addInteraction: (groupId: number) => number; // return id of newly created interaction
  setInteractionType: (type: LyraInteractionType, id: number) => void;
  addWidgetSignals: (type: Signal[], id: number) => void;
}

function mapStateToProps(state: State, ownProps): StateProps {
  const marks: Map<string, MarkRecord> = state.getIn(['vis', 'present', 'marks']);
  const groups = marks.filter((mark: MarkRecord) => {
    return mark.type === 'group';
  }).valueSeq().map((x: GroupRecord) => x._id).toArray();

  return {groups};

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
    setInteractionType: (type: LyraInteractionType, id: number) => {
      dispatch(setInteractionType(type, id));
    },
    addWidgetSignals: (type: Signal[], id:number) => {
      dispatch(addWidgetSignals(type, id));
    }
  };
}

function generateSignals(fieldDef, dsId) {
  let signals = [];
  const DEFAULT = '_widget_default';
  const name = fieldDef.name;
  if(fieldDef.mtype === QUANTITATIVE) {
    const {max, min, mid, quart1, quart2, length} = dsUtil.widgetParams(fieldDef, dsId);
    signals.push({name: name+DEFAULT, init: min, bind: {name, input: 'range', min, max, step: Math.floor((max-min)/length)}});
    signals.push({name: name+'1', bind:{name, input: 'select', element: '.widget_1', options:[min, quart1, mid, quart2, max]}});
    signals.push({name: name+'2', bind:{name, input: 'radio', element: '.widget_2', options:[min, quart1, mid, quart2, max]}});
    signals.push({name: name+'3', update: name+DEFAULT, bind:{name, input: 'text', element: '.widget_3'}});

    return signals;
  } else {
    signals.push({name: name+DEFAULT, bind: {name, input: 'range', min: 0, max: 100, step: 1}});
  }

  return signals;
}

class InteractionWidget extends React.Component<StateProps & DispatchProps, OwnState> {

  constructor(props) {
    super(props);
    this.state = {
      field: [],
      closed: true
    }
  }

  // public componentDidUpdate(prevProps: StateProps, prevState) {
  // }

  public handleDrop = (evt)  => {
    const dt = evt.dataTransfer;
    const dsId = dt.getData('dsId');
    const fieldDefn = JSON.parse(dt.getData('fieldDef'));
    console.log(fieldDefn);
    const fieldObj = this.state.field.filter(e => e.id===dsId && e.fieldDef.name === fieldDefn.name);

    if(!fieldObj.length) {
      this.setState(prevState => ({
        field: [...prevState.field, {fieldDef: fieldDefn, id: dsId}]
      }))

      const interactionId = this.props.addInteraction(this.props.groups[0]);
      this.props.setInteractionType('widget', interactionId);
      this.props.addWidgetSignals(generateSignals(fieldDefn, dsId), interactionId)
      this.setState({closed: false});
      // add the widget in the viz
      // ctrl.update();
      // launch demonstration mode
    }
  };

  public handleDragOver = (evt) => {
    if (evt.preventDefault) {
      evt.preventDefault(); // Necessary. Allows us to drop.
    }
  };
  public render() {

    const widgetFields = this.state.field.map(e=><span key={e.fieldDef.name}>{e.fieldDef.name + " "}</span>)

    return (
      <React.Fragment>
        <div className="interaction-widget" onDragOver={this.handleDragOver} onDrop={this.handleDrop}>
          {this.state.field.length ? widgetFields : null}
          <div><i>Drop a field to add a widget</i></div>
        </div>
        <div className={'widgetPanel' + (this.state.closed ? " disabled" : "")}>
          <div className='widgetDemonstration widget_1'></div>
          <div className='widgetDemonstration widget_2'></div>
          <div className='widgetDemonstration widget_3'></div>
          <div><button onClick={()=> this.setState({closed: true})}>Done</button></div>
        </div>
      </React.Fragment>
    )
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(InteractionWidget);