import * as React from 'react';
import {connect} from 'react-redux';
import {View, parse, Spec} from 'vega';
import {HistoryRecord, HistoryState} from '../../store/factory/History';
import {cleanHistorySpec} from './HistoryList';
import {startDragging, stopDragging} from '../../actions/inspectorActions';
import {DraggingStateRecord, HistoryDraggingState} from '../../store/factory/Inspector';
import sg from '../../ctrl/signals';
import {MODE, SELECTED, CELL} from '../../store/factory/Signal';
import {State} from '../../store';
import {NumericValueRef, StringValueRef, tupleid} from 'vega';
import {channelName} from '../../actions/bindChannel';
import {setMarkVisual} from '../../actions/markActions';
import * as vega from 'vega';
import bindChannel from '../../actions/bindChannel';
import {ColumnRecord} from '../../store/factory/Dataset';
import {ActionCreators as historyActions} from 'redux-undo/src';

const ctrl = require('../../ctrl');


interface OwnProps {
  id: number,
  subIndex?: number,

  historyId: number,
  width: number;
  height: number;
  isCurrent: boolean;
}

interface StateProps {
  history: HistoryRecord // TODO(ej): use History.ts so you just have to pass the id
}
interface DispatchProps {

  startDragging: (d: DraggingStateRecord) => void; // TODO(ej): use this for custom drop zones later
  stopDragging: () => void; // TODO(ej): use this for custom drop zones later
  setMarkVisual: (payload: {property: string, def: NumericValueRef | StringValueRef}, markId: number) => void;

  bindChannel: (dsId: number, field: ColumnRecord, markId: number, property: string) => void;
  jump: (index: number) => void;
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  return {
    history: state.getIn(['vis', '_allStates'])[ownProps.historyId],
  };
}

const actionCreators: DispatchProps = {startDragging, stopDragging, setMarkVisual, bindChannel, ...historyActions};

export class HistoryItemInspector extends React.Component<OwnProps & StateProps & DispatchProps> {

  constructor(props) {
    super(props);
  }

  public handleClick = (historyId: number) => {
    this.props.jump(historyId);
  }
  public handleDragStart = (historyId: number, history: any) => {
    const sel = sg.get(SELECTED);
    const lyraId = +sel.mark.role.split('lyra_')[1]; // id of thing that was dropped onto
    this.props.startDragging(HistoryDraggingState({historyId, lyraId, history})); // TODO(ej) use this for custom drop zones

    // sg.set(MODE, 'channels');
    // ctrl.update();
  }

  public handleDragEnd = (evt: React.DragEvent<HTMLDivElement>, opts?) => {
    const props = this.props;
    const sel = sg.get(SELECTED);
    const cell = sg.get(CELL);
    const dropped = tupleid(sel) && tupleid(cell);

    try {
      if (dropped) {
        // const lyraId = +sel.mark.role.split('lyra_')[1]; // id of thing that was dropped onto
        // const channel = channelName(cell.key);
        // let fieldName, dsId;
        // if (channel === 'x' || channel === 'y' || channel === 'color' || channel === 'size') { // TODO(ej): Adapt this to work with other mark types. channels won't always be color and size though x and y are consistent
        //   // set scale
        //   let channelScaleIds = this.props.history.getIn(["guides"])
        //     .map((g) => {
        //       return channel == 'x' || channel == 'y' ? g.scale : channel == 'size' ? g[channel] : g.fill;
        //     })
        //     .filter((scaleId) => {
        //       let scaleName = scaleId ? this.props.history.getIn(["scales"]).get(scaleId).name : null;
        //       return scaleName === channel;
        //     });

        //   fieldName = channelScaleIds.map((scaleId) => {
        //     let scaleRecord = this.props.history.getIn(["scales"]).get(scaleId);
        //     return scaleRecord.get('_domain').length > 0 ?  scaleRecord.get('_domain')[0].field : null;
        //   }).first();

        //   dsId = channelScaleIds.map((scaleId) => {
        //     let scaleRecord = this.props.history.getIn(["scales"]).get(scaleId);
        //     return scaleRecord.get('_domain').length > 0 ?  scaleRecord.get('_domain')[0].data : null;
        //   }).first();


        // }

        // const bindField = this.props.history.getIn(["datasets", String(dsId), "_schema", fieldName]).toJS();
        // vega.extend(bindField, opts); // Aggregate or Bin passed in opts.
        // props.bindChannel(dsId, bindField, lyraId, cell.key);
      }
    } catch (e) {
      console.error('Unable to bind primitive');
      console.error(e);
    }

    this.props.stopDragging();
    // sg.set(MODE, 'handles');
    // sg.set(CELL, {});

    ctrl.update(); // Apply changes

  }

  private getHistorySpec(): Spec {
    let historySpec = ctrl.export(false, this.props.history);
    if (historySpec.marks) {
      historySpec = cleanHistorySpec(historySpec, this.props.width, this.props.height);
    }

    return historySpec;
  }

  private view;

  public componentDidUpdate() {
    console.log("update", this.props.id);
  }

  public componentDidcomponentWillUnmountUpdate() {
    console.log("unmount", this.props.id);
  }

  public componentDidMount() {
    const spec = this.getHistorySpec();
    this.view = new View(parse(spec), {
      renderer:  'canvas',  // renderer (canvas or svg)
      container: `#history-test-${this.props.id}`   // parent DOM container
    });
    this.view.width(this.props.width);
    this.view.height(this.props.height);
    this.view.runAsync();
  }

  public render() {
    let subIndex = this.props.subIndex;
    return (
      <div id={`history-test-${this.props.id}`}
      className={"history-preview"+(this.props.isCurrent ? " selected" : "")} style={subIndex != null ? {top: -1*(subIndex)*5, left:-1*(subIndex)*5} : {}}
      draggable={true}
      key={this.props.id}
      onClick={() => this.handleClick(this.props.id)}
      onDragStart={() => this.handleDragStart(this.props.id, this.props.history)}
      onDragEnd={this.handleDragEnd}></div>
    );

  }
}

export const HistoryItem = connect(
  mapStateToProps,
  actionCreators
)(HistoryItemInspector);
