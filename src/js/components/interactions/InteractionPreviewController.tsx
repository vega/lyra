import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../../store';
import {Signal, Spec} from 'vega';
import {getScaleNameFromAxisRecords, getFieldFromScaleRecordName, cleanSpecForPreview, editSignalsForPreview, intervalPreviewDefs, pointPreviewDefs, mappingPreviewDefs, editMarksForPreview} from '../../ctrl/demonstrations';
import InteractionPreview from './InteractionPreview';

const ctrl = require('../../ctrl');
const listeners = require('../../ctrl/listeners');

interface OwnProps {
  group: string, // name of group mark (view) this preview is attached to
}
interface StateProps {
  vegaIsParsing: boolean,
  canDemonstrate: boolean,
  // names: {xScaleName: string, yScaleName: string, xFieldName: string, yFieldName: string}
}

export interface LyraInteractionPreviewDef {
  id: string,
  label: string,
  ref?: React.RefObject<InteractionPreview>,
  signals: Signal[]
}

export interface LyraMappingPreviewDef {
  id: string,
  label: string,
  ref?: React.RefObject<InteractionPreview>,
  signals: Signal[],
  properties: any // encode.update object
}

interface OwnState {
  isDemonstratingInterval: boolean,
  isDemonstratingPoint: boolean,
  spec: Spec,
  interactionPreviews: LyraInteractionPreviewDef[],
  mappingPreviews: LyraMappingPreviewDef[]
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  const xScaleName = getScaleNameFromAxisRecords(state, 'x'); // TODO(jzong) how do we distinguish which view (group mark) an axis belongs to?
  const yScaleName = getScaleNameFromAxisRecords(state, 'y');

  const xFieldName = getFieldFromScaleRecordName(state, xScaleName);
  const yFieldName = getFieldFromScaleRecordName(state, yScaleName);

  const canDemonstrate = Boolean(ctrl.view && xScaleName && yScaleName && xFieldName && yFieldName);

  const isParsing = state.getIn(['vega', 'isParsing']);
  return {
    vegaIsParsing: isParsing,
    canDemonstrate,
    // names: {xScaleName, xFieldName, yScaleName, yFieldName}
  };
}


class InteractionPreviewController extends React.Component<OwnProps & StateProps, OwnState> {

  constructor(props) {
    super(props);

    this.state = {
      isDemonstratingInterval: false,
      isDemonstratingPoint: false,
      spec: null,
      interactionPreviews: [],
      mappingPreviews: []
    };
  }

  public componentDidUpdate(prevProps: OwnProps & StateProps, prevState: OwnState) {

    if (prevProps.vegaIsParsing && !this.props.vegaIsParsing) {
      const spec = cleanSpecForPreview(ctrl.export());
      // spec = resizeSpec(spec, 100, 100);
      this.setState({
        spec
      });
    }

    if (!prevProps.canDemonstrate && this.props.canDemonstrate) {
      this.onSignal('brush_x', (name, value) => this.onMainViewIntervalSignal(name, value));
      this.onSignal('brush_y', (name, value) => this.onMainViewIntervalSignal(name, value));
      this.onSignal('points_tuple', (name, value) => this.onMainViewPointSignal(name, value));
      this.onSignal('points_toggle', (name, value) => this.onMainViewPointSignal(name, value));
      this.onSignal('datum', (name, value) => this.onMainViewPointSignal(name, value));
      this.onSignal('points', (name, value) => {
        const isDemonstratingPoint = Object.keys(value).length > 0;
        this.setState({
          isDemonstratingPoint
        });
      });
    }
    else if (prevProps.canDemonstrate && !this.props.canDemonstrate) {
      if (ctrl.view) {
        this.offSignal('brush_x');
        this.offSignal('brush_y');
      }
    }

    if (prevState.isDemonstratingInterval !== this.state.isDemonstratingInterval ||
        prevState.isDemonstratingPoint !== this.state.isDemonstratingPoint) {
      this.setState({
        interactionPreviews: this.getInteractionPreviewDefs(),
        mappingPreviews: this.getMappingPreviewDefs()
      });
    }
  }

  private signalHandlers = {};
  private mainViewSignalValues = {};

  private getInteractionPreviewDefs(): LyraInteractionPreviewDef[] {
    if (this.state.isDemonstratingInterval) {
      return intervalPreviewDefs;
    }
    if (this.state.isDemonstratingPoint) {
      return pointPreviewDefs;
    }
    return [];
  }

  private getMappingPreviewDefs(): LyraMappingPreviewDef[] {
    if (this.state.isDemonstratingInterval || this.state.isDemonstratingPoint) {
      return mappingPreviewDefs(this.state.isDemonstratingInterval);
    }
    return [];
  }

  private onMainViewPointSignal(name, value) {
    console.log(name, value)

    this.state.interactionPreviews.forEach(preview => {
      if (preview.ref.current) {
        preview.ref.current.setPreviewSignal(name, value);
      }
    });
    this.state.mappingPreviews.forEach(preview => {
      if (preview.ref.current) {
        preview.ref.current.setPreviewSignal(name, value);
      }
    });
  }

  private onMainViewIntervalSignal(name, value) {
    this.mainViewSignalValues[name] = value;
    const isDemonstratingInterval = this.mainViewSignalValues['brush_x'] &&
      this.mainViewSignalValues['brush_y'] &&
      this.mainViewSignalValues['brush_x'][0] !== this.mainViewSignalValues['brush_x'][1] &&
      this.mainViewSignalValues['brush_y'][0] !== this.mainViewSignalValues['brush_y'][1];
    this.setState({
      isDemonstratingInterval
    });

    const wScale = 100/640;
    const hScale = 100/360; // TODO(jzong) preview height / main view height

    const scaledValue = value.map(n => {
      if (name === 'brush_x') {
        return n * wScale;
      }
      else if (name === 'brush_y') {
        return n * hScale;
      }
    });

    this.state.interactionPreviews.forEach(preview => {
      if (preview.ref.current) {
        preview.ref.current.setPreviewSignal(name, scaledValue);
      }
    });
    this.state.mappingPreviews.forEach(preview => {
      if (preview.ref.current) {
        preview.ref.current.setPreviewSignal(name, scaledValue);
      }
    });
  }


  private onSignal(signalName, handler) {
    if (!this.signalHandlers[signalName]) {
      this.signalHandlers[signalName] = handler;
      listeners.onSignalInGroup(ctrl.view, this.props.group, signalName, this.signalHandlers[signalName]);
    }
  }

  private offSignal(signalName) {
    if (this.signalHandlers[signalName]) {
      listeners.offSignalInGroup(ctrl.view, this.props.group, signalName, this.signalHandlers[signalName]);
      this.signalHandlers[signalName] = null;
    }
  }

  public render() {

    return (
      <div className={"preview-controller" + (this.state.interactionPreviews.length  ? " active" : "")}>
        {this.state.interactionPreviews.length ? <h2>Interactions</h2> : null}
        {this.state.interactionPreviews.length ? <h5>Selections</h5> : null}
        <div className="preview-scroll">
          {
            this.state.interactionPreviews.map((preview) => {
              preview.ref = React.createRef();
              const spec = editSignalsForPreview(this.state.spec, this.props.group, preview.signals);
              return (
                <div>
                  <div className="preview-label">{preview.label}</div>
                  <InteractionPreview key={preview.id} ref={preview.ref} id={`preview-${preview.id}`} group={this.props.group} spec={spec}/>
                </div>
              )
            })
          }
        </div>
        {this.state.mappingPreviews.length ? <h5>Mappings</h5> : null}
        <div className="preview-scroll">
          {
            this.state.mappingPreviews.map((preview) => {
              preview.ref = React.createRef();
              let spec = editSignalsForPreview(this.state.spec, this.props.group, preview.signals);
              spec = editMarksForPreview(spec, this.props.group, preview.properties);
              return (
                <div>
                  <div className="preview-label">{preview.label}</div>
                  <InteractionPreview key={preview.id} ref={preview.ref} id={`preview-${preview.id}`} group={this.props.group} spec={spec}/>
                </div>
              )
            })
          }
        </div>
      </div>
    );
  }

}

export default connect(mapStateToProps)(InteractionPreviewController);
