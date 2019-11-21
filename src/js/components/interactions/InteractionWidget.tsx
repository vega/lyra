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

const dsUtil = require('../../util/dataset-utils');
const WG_DEFAULT = '_widget_default';

interface StateProps {
  groups: number[],
  groupName: string
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

function mapStateToProps(state: State, ownProps): StateProps {
  const marks: Map<string, MarkRecord> = state.getIn(['vis', 'present', 'marks']);
  const groups = marks.filter((mark: MarkRecord) => {
    return mark.type === 'group';
  }).valueSeq().map((x: GroupRecord) => x._id).toArray();
  const groupRecord: GroupRecord = state.getIn(['vis', 'present', 'marks', String(groups[0])]);
  return {groups, groupName: exportName(groupRecord.name)};

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
    const {max, min, mid, quart1, quart2, length} = dsUtil.widgetParams(fieldDef, dsId);
    signals.push({name: name+WG_DEFAULT, init: mid, bind: {name, input: 'range', min, max, step: Math.floor((max-min)/length)}});
    signals.push({name: name+'1', init: mid, bind: {name, element: '.'+name+1, input: 'range', min, max, step: Math.floor((max-min)/length)}});
    signals.push({name: name+'2', bind:{name, input: 'select', element: '.'+name+2, options:[min, quart1, mid, quart2, max]}});
    signals.push({name: name+'3', bind:{name, input: 'radio', element: '.'+name+3, options:[min, quart1, mid, quart2, max]}});
    signals.push({name: name+'4', init: mid, bind:{name, input: 'text', element: '.'+name+4}});
    return signals;
  } else {
    signals.push({name: name+WG_DEFAULT, bind: {name, input: 'range', min: 0, max: 100, step: 1}});
  }

  return signals;
}

function getDefaultMapping(fieldDef, groupName) {
  return {
    id: 'color',
    label: 'Color',
    groupName,
    markProperties: {
      "encode": {
        "update": {
          "fill": [
            {
              "test": `datum.${fieldDef.name} <= ${fieldDef.name+WG_DEFAULT}`,
              "value": "orange"
            },
            {"value": "grey"}
          ],
        }
      }
    }
  }
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
      const interactionId = this.props.addInteraction(this.props.groups[0]);
      this.setState(prevState => ({
        field: [...prevState.field, {fieldDef: fieldDefn, dsId, interactionId}],
        closed: panelState
      }));

      this.props.setSelection({
        id: 'widget_'+fieldDefn.name+'1',
        label: 'Widget',
        signals: generateSignals(fieldDefn, dsId),
      }, interactionId)

      this.props.setMapping(getDefaultMapping(fieldDefn, this.props.groupName), interactionId);
    }
  };

  public handleDragOver = (evt) => {
    if (evt.preventDefault) {
      evt.preventDefault(); // Necessary. Allows us to drop.
    }
  };
  public render() {

    const widgetFields = this.state.field.map(e=><span key={e.fieldDef.name}>{e.fieldDef.name + " "}</span>)
    const widgetPanels = this.state.field.map((e, i) => <WidgetPanel id={e.interactionId} closed={this.state.closed[i]} name={e.fieldDef.name}></WidgetPanel>)

    return (
      <React.Fragment>
        <div className="interaction-widget" onDragOver={this.handleDragOver} onDrop={this.handleDrop}>
          {this.state.field.length ? widgetFields : null}
          <div><i>Drop a field to add a widget</i></div>
        </div>
        {this.state.field.length ? widgetPanels : null}
      </React.Fragment>
    )
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(InteractionWidget);