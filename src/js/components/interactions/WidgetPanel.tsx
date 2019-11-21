import * as React from 'react';
import {Dispatch} from 'redux';
import {connect} from 'react-redux';
import {State} from '../../store';
import {InteractionRecord} from '../../store/factory/Interaction';
import {setSelection} from '../../actions/interactionActions';
import {LyraSelectionPreviewDef} from './InteractionPreviewController';

const WG_DEFAULT = '_widget_default';

interface OwnProps {
  closed: boolean,
  name: string,
  id: number
}

interface DispatchProps {
  setSelection: (def: any, id: number) => void;
}
interface StateProps {
  selectionDef: LyraSelectionPreviewDef,
}

function mapStateToProps(state: State, ownProps) {
  const record: InteractionRecord = state.getIn(['vis', 'present', 'interactions', String(ownProps.id)]);
  const selectionDef = record.selectionDef;
  return {selectionDef};

}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    setSelection: (def: any, id: number) => {
      dispatch(setSelection(def, id));
    },
  };
}

class WidgetPanel extends React.Component<StateProps & DispatchProps & OwnProps> {
  constructor(props) {
    super(props);

    this.changeSignals = this.changeSignals.bind(this);
  }

  public changeSignals = (i: number) => {
    const newName = 'widget_'+this.props.name+i;
    if(this.props.selectionDef.id===newName) return;
    const signals = JSON.parse(JSON.stringify(this.props.selectionDef.signals))
    const copySignal = JSON.parse(JSON.stringify(signals[i]));
    copySignal.name = this.props.name+WG_DEFAULT;
    delete copySignal['bind'].element;
    signals[0] = copySignal;
    this.props.setSelection({
      id: 'widget_'+this.props.name+i,
      label: 'Widget',
      signals,
    }, this.props.id)
  };

  public render() {

    const wD = [1,2,3,4].map(i => {
      return <div onClick={() => this.changeSignals(i)} key={i} className={'widgetDemonstration ' +  this.props.name + i}></div>
    })
    return (
      <div className={'widgetPanel' + (this.props.closed ? " disabled" : "")}>
        {wD}
        {/* <div><button onClick={()=> this.setState({closed: true})}>Done</button></div> */}
        <div><button>Done</button></div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WidgetPanel);