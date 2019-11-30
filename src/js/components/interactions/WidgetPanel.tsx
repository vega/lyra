import * as React from 'react';
import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import {Map} from 'immutable';
import {WG_DEFAULT} from './InteractionWidget';
import {State} from '../../store';
import {InteractionRecord} from '../../store/factory/Interaction';
import {setSelection, setMapping} from '../../actions/interactionActions';
import {LyraSelectionPreviewDef} from './InteractionPreviewController';
import {widgetMappingPreviewDefs} from '../../ctrl/demonstrations';
import exportName from '../../util/exportName';
import {MarkRecord} from '../../store/factory/Mark';
import {GroupRecord} from '../../store/factory/marks/Group';

interface OwnProps {
  closed: boolean,
  name: string,
  id: number,
  managePane: (t: boolean) => void,
}

interface DispatchProps {
  setSelection: (def: any, id: number) => void;
  setMapping: (def: any, id: number) => void;
}
interface StateProps {
  interaction: InteractionRecord,
  groupNames: string[],
}

interface OwnState {
  comp: string,
  groupName: string,
}

function mapStateToProps(state: State, ownProps) {
  const interaction: InteractionRecord = state.getIn(['vis', 'present', 'interactions', String(ownProps.id)]);
  const marks: Map<string, MarkRecord> = state.getIn(['vis', 'present', 'marks']);
  const groups = marks.filter((mark: MarkRecord) => {
    return mark.type === 'group';
  }).valueSeq().map((x: GroupRecord) => x._id).toArray();
  const groupNames = groups.map(id => {
    const record = state.getIn(['vis', 'present', 'marks', String(id)]);
    return exportName(record.name);
  })
  return {interaction, groupNames};
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    setSelection: (def: any, id: number) => {
      dispatch(setSelection(def, id));
    },
    setMapping: (def: any, id: number) => {
      dispatch(setMapping(def, id));
    },
  };
}



class WidgetPanel extends React.Component<StateProps & DispatchProps & OwnProps, OwnState> {
  constructor(props) {
    super(props);

    this.state = {
      comp: '>=',
      groupName: '',
    }

    this.changeSignals = this.changeSignals.bind(this);
  }

  public componentWillReceiveProps = (nextProps) => {
    if(nextProps.groupNames[0] != this.state.groupName) {
      this.setState({groupName: nextProps.groupNames[0],});
    }
  };
  public changeSignals = (i: number) => {
    const newName = 'widget_'+this.props.name+i;
    if(this.props.interaction.selectionDef.id===newName) return;
    const signals = JSON.parse(JSON.stringify(this.props.interaction.selectionDef.signals))
    const copySignal = JSON.parse(JSON.stringify(signals[i]));
    copySignal.name = this.props.name+WG_DEFAULT;
    delete copySignal['bind'].element;
    signals[0] = copySignal;
    this.props.setSelection({
      id: 'widget_'+this.props.name+i,
      label: 'Widget',
      field: this.props.name,
      signals,
    }, this.props.id)
  };

  public handleComparatorChange = (comp) => {
    if (comp!=this.state.comp) {
      const defs= widgetMappingPreviewDefs(this.props.name, this.state.groupName, comp);
      const def = defs.filter(d => d.id == this.props.interaction.mappingDef.id);
      this.props.setMapping(def[0], this.props.id);
      this.setState({comp});
    }
  }

  public handleGroupChange = (groupName) => {
    if (groupName!=this.state.groupName) {
      const defs= widgetMappingPreviewDefs(this.props.name, groupName, this.state.comp);
      const def = defs.filter(d => d.id == this.props.interaction.mappingDef.id);
      this.props.setMapping(def[0], this.props.id);
      this.setState({groupName});
    }
  }
  public render() {

    const wD = [1,2,3,4].map(i => {
      return <div onClick={() => this.changeSignals(i)} key={i} className={'widgetDemonstration ' +  this.props.name + i}></div>
    });

    const comparators = ['==', '>', '<', '>=', '<=', '!='];
    const compOptions = comparators.map(e=> {
      return <option key={e} value={e}>{e}</option>
    });

    const groupOptions = this.props.groupNames.map(e => {
      return <option key={e} value={e}>{e}</option>
    })

    return (
      <div className={'widgetPanel' + (this.props.closed ? " disabled" : "")}>
        {wD}
        <br />
        Comparaison Operator:
        <select value={this.state.comp} onChange={e => this.handleComparatorChange(e.target.value)}>
            {compOptions}
        </select>
        <br />
        Add to Group:
        <select value={this.state.groupName} onChange={e => this.handleGroupChange(e.target.value)}>
            {groupOptions}
        </select>
        <br />
        <div><button onClick={()=> this.props.managePane(true)}>Done</button></div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WidgetPanel);