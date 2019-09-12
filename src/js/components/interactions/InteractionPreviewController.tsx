import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../../store';
import {Signal, Spec} from 'vega';
import {getScaleNameFromAxisRecords, getFieldFromScaleRecordName, resizeSpec, cleanSpecForPreview, editSignalsForPreview, intervalPreviewDefs} from '../../ctrl/demonstrations';
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
  ref?: React.RefObject<InteractionPreview>,
  signals: Signal[]
}

interface OwnState {
  isDemonstratingInterval: boolean,
  isDemonstratingPoint: boolean,
  spec: Spec,
  previews: LyraInteractionPreviewDef[]
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
      previews: []
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
      this.onSignal('brush_x', (name, value) => this.onMainViewSignal(name, value));
      this.onSignal('brush_y', (name, value) => this.onMainViewSignal(name, value));
    }
    else if (prevProps.canDemonstrate && !this.props.canDemonstrate) {
      if (ctrl.view) {
        this.offSignal('brush_x');
        this.offSignal('brush_y');
      }
    }

    if (prevState.isDemonstratingInterval !== this.state.isDemonstratingInterval) {
      this.setState({
        previews: this.getPreviewDefs()
      });
    }
  }

  private signalHandlers = {};
  private mainViewSignalValues = {};

  private getPreviewDefs(): LyraInteractionPreviewDef[] {
    if (this.state.isDemonstratingInterval) {
      return intervalPreviewDefs;
    }
    return [];
  }

  private onMainViewSignal(name, value) {
    this.mainViewSignalValues[name] = value;
    const isDemonstratingInterval = this.mainViewSignalValues['brush_x'] && this.mainViewSignalValues['brush_y'] && this.mainViewSignalValues['brush_x'] !== this.mainViewSignalValues['brush_y'];
    this.setState({
      isDemonstratingInterval
    });

    this.state.previews.forEach(preview => {
      if (preview.ref.current) {
        preview.ref.current.setPreviewSignal(name, value);
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
      <div className="preview-controller">
        {
          this.state.previews.map((preview) => {
            preview.ref = React.createRef();
            const spec = editSignalsForPreview(this.state.spec, this.props.group, preview.signals);
            return <InteractionPreview key={preview.id} ref={preview.ref} id={`preview-${preview.id}`} group={this.props.group} spec={spec}/>;
          })
        }
      </div>
    );
  }

}

export default connect(mapStateToProps)(InteractionPreviewController);
