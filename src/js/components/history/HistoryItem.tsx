import * as React from 'react';
import {connect} from 'react-redux';
import { Dispatch } from 'redux';
import {View, parse, Spec} from 'vega';
import {HistoryRecord, HistoryState} from '../../store/factory/History';
import {addSelectionToScene, addApplicationToScene, cleanSpecForPreview} from '../../ctrl/demonstrations';
import {startDragging, stopDragging} from '../../actions/inspectorActions';
import {DraggingStateRecord, HistoryDraggingState} from '../../store/factory/Inspector';
import {getClosestGroupId} from '../../util/hierarchy';
import {mergeHistory} from '../../actions/historyActions';
import sg from '../../ctrl/signals';
import {MODE, SELECTED, CELL} from '../../store/factory/Signal';
import {NumericValueRef, StringValueRef, tupleid} from 'vega';
import {channelName} from '../../actions/bindChannel';
import {setMarkVisual} from '../../actions/markActions';
import * as vega from 'vega';
import bindChannel from '../../actions/bindChannel';
import {ColumnRecord, Schema} from '../../store/factory/Dataset';
import { AnyAction } from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {State} from '../../store';
import {setSignal} from '../../actions/signalActions';
import {OnEvent, SignalValue} from 'vega-typings/types';
import {batchGroupBy} from '../../reducers/historyOptions';

const listeners = require('../../ctrl/listeners');
const ctrl = require('../../ctrl');


interface OwnProps {
  id: string,
  history: HistoryRecord

  groupNames: any[];
}
interface DispatchProps {
  mergeHistory: (id: number) => void;
  startDragging: (d: DraggingStateRecord) => void;
  stopDragging: () => void;
  setMarkVisual: (payload: {property: string, def: NumericValueRef | StringValueRef}, markId: number) => void;

  bindChannel: (dsId: number, field: ColumnRecord, markId: number, property: string) => void;

  setSignal: (value: SignalValue, signal: string) => void;
}

function mapDispatchToProps(dispatch: ThunkDispatch<State, null, AnyAction>, ownProps: OwnProps): DispatchProps {
  return {
    mergeHistory: (id: number) => {
      dispatch(mergeHistory(id));
    },
    startDragging: (d: DraggingStateRecord) => {
      dispatch(startDragging(d)); },
    stopDragging: () => {
      dispatch(stopDragging()); },
    setMarkVisual: (p, markId) => {
      dispatch(setMarkVisual(p, markId));
    },
    bindChannel: (dsId: number, field: ColumnRecord, markId: number, property: string) => {
      dispatch(bindChannel(dsId, field, markId, property));
    },
    setSignal: (value: SignalValue, signal: string) => {
      dispatch(setSignal(value, signal));
    }
  };
}

export class HistoryItemInspector extends React.Component<OwnProps & DispatchProps> {

  constructor(props) {
    super(props);
  }

  private width = 100; // these should match baseSignals in demonstrations.ts
  private height = 100; //

  public handleClick = (historyId: number) => {
    // this.props.mergeHistory(historyId);

  }
  public handleDragStart = (historyId: number) => {
    this.props.startDragging(HistoryDraggingState({historyId}));

    sg.set(MODE, 'channels');
    ctrl.update();
  }

  public handleDragEnd = (evt: React.DragEvent<HTMLDivElement>, opts?) => {
    const props = this.props;
    const sel = sg.get(SELECTED);
    const cell = sg.get(CELL);
    const dropped = tupleid(sel) && tupleid(cell);

    try {
      const lyraId = +sel.mark.role.split('lyra_')[1]; // id of thing that was dropped onto

      if (dropped) {
        const channel = channelName(cell.key);
        let fieldName, dsId;
        if (channel === 'x' || channel === 'y' || channel === 'color' || channel === 'size') {
          // set scale
          let guides = this.props.history.getIn(["guides"]).map((g) => {
            return channel == 'x' || channel == 'y' ? g.scale : channel == 'size' ? g[channel] : g.fill;
          })
          let id = guides.filter((scaleId) => {
            let scaleName = this.props.history.getIn(["scales"]).get(scaleId).name;
            return scaleName === channel;
          });

          fieldName = id.map((scaleId) => {
            let scaleRecord = this.props.history.getIn(["scales"]).get(scaleId);
            return scaleRecord.get('_domain').length > 0 ?  scaleRecord.get('_domain')[0].field : null;
          });

          dsId = id.map((scaleId) => {
            let scaleRecord = this.props.history.getIn(["scales"]).get(scaleId);
            return scaleRecord.get('_domain').length > 0 ?  scaleRecord.get('_domain')[0].data : null;
          });


        }

        const bindField = this.props.history.getIn(["datasets", String(dsId.first()), "_schema", fieldName.first()]);
        vega.extend(bindField.toJS(), opts); // Aggregate or Bin passed in opts.
        props.bindChannel(dsId.first(), bindField.toJS(), lyraId, cell.key);
      } else {
        // update the whole symbol/mark: shape, size
        // the history has the signals
        let relevantProps = ["size", "shape", "fill", "fillOpacity", "stroke",  "strokeWidth"];
        let historyMark = this.props.history.getIn(["marks", String(lyraId)]); // assume mark is the same as before. wanna revert to old settings of old mark

        batchGroupBy.start();
        relevantProps.forEach((prop) => {
          let historyProp = historyMark.getIn(["encode", "update", prop]);
          if (historyProp.signal) {
            let historySigVal = this.props.history.getIn(["signals", historyProp.signal]).value;
            this.props.setSignal(historySigVal, historyProp.signal);
            sg.set(historyProp.signal, historySigVal, false);
            // this.props.setMarkVisual(
            //   { property: prop, def: historySigVal},
            //   lyraId
            // );
          }
        });
        batchGroupBy.end();
      }
    } catch (e) {
      console.error('Unable to bind primitive');
      console.error(e);
    }

    this.props.stopDragging();
    sg.set(MODE, 'handles');
    sg.set(CELL, {});

    ctrl.update();

  }

  private historyToSpec(preview: HistoryRecord): Spec {
    let historySpec = ctrl.export(false, this.props.history);
    if (historySpec.marks) {
      historySpec = cleanSpecForPreview(historySpec, this.width, this.height, null, parseInt(this.props.id), true);
    }

    return historySpec;
  }

  private view;


  public componentDidMount() {
    const spec = this.historyToSpec(this.props.history);
    this.view = new View(parse(spec), {
      renderer:  'svg',  // renderer (canvas or svg)
      container: `#history-test-${this.props.id}`   // parent DOM container
    });
    this.view.width(this.width);
    // this.view.signal("width", this.width);
    this.view.height(this.height);
    // this.view.signal("height", this.height);
    this.view.runAsync();
  }

  // public componentDidUpdate(prevProps: OwnProps) {
  //   if (!prevProps.canDemonstrate && this.props.canDemonstrate || prevProps.groupName !== this.props.groupName || prevProps.history !== this.props.history) {
  //     const spec = this.historyToSpec(this.props.preview);

  //     this.view = new View(parse(spec), {
  //       renderer:  'svg',  // renderer (canvas or svg)
  //       container: `#${this.props.groupName}-${this.props.id}`   // parent DOM container
  //     });
  //     this.view.width(this.width);
  //     this.view.height(this.height);
  //     this.view.runAsync();
  //   }
  // };

  private scaleSignalValues(name, value) {
    const wScale = this.width/640; // preview width / main view width
    const hScale = this.height/360; // preview height / main view height

    if (name.startsWith('brush_x') && Array.isArray(value)) {
      return value.map(n => {
        return n * wScale;
      });
    }
    if (name.startsWith('brush_y') && Array.isArray(value)) {
      return value.map(n => {
        return n * hScale;
      });
    }
    if (name.startsWith('grid_translate_delta')) {
      return value ? {
        x: value.x * wScale,
        y: value.y * hScale
      } : value;
    }

    return value;
  }

  // public setPreviewSignal(name, value) {
  //   if (this.view) {
  //     const scaledValue = this.scaleSignalValues(name, value);
  //     listeners.setSignalInGroup(this.view, this.props.groupName, name, scaledValue);
  //     this.view.runAsync();
  //   }
  // }

  // public getPreviewSignal(name) {
  //   if (this.view) {
  //     return listeners.getSignalInGroup(this.view, this.props.groupName, name);
  //   }
  // }

  public render() {

    return (
      <div id={`history-test-${this.props.id}`}
      className={"history-preview"}
      draggable={true}
              key={this.props.id}
              onClick={() => this.handleClick(parseInt(this.props.id))}
              onDragStart={() => this.handleDragStart(parseInt(this.props.id))}
              onDragEnd={this.handleDragEnd}></div>
    );

  }

}

export const HistoryItem = connect(
  null,
  mapDispatchToProps
)(HistoryItemInspector);
