import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../../store';
import {View, parse} from 'vega';
import {getScaleNameFromAxisRecords, getFieldFromScaleRecordName} from '../../ctrl/demonstrations';
import {GuideRecord} from '../../store/factory/Guide';
import {Map} from 'immutable';
import {ScaleRecord} from '../../store/factory/Scale';

const ctrl = require('../../ctrl');
const listeners = require('../../ctrl/listeners');

interface OwnProps {
  id: string,
  group: string, // name of group mark (view) this preview is attached to
}
interface StateProps {
  vegaIsParsing: boolean,
  canDemonstrate: boolean
}

interface OwnState {
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
    canDemonstrate
  };
}

class InteractionPreview extends React.Component<OwnProps & StateProps, OwnState> {

  constructor(props) {
    super(props);

    this.state = {

    };
  }

  private view;

  private attachView() {
    this.view = new View(parse(ctrl.export()), {
      renderer:  'svg',  // renderer (canvas or svg)
      container: '#'+this.props.id,   // parent DOM container
      hover:     true       // enable hover processing
    });
    this.view.width(100);
    this.view.height(100);
    this.view.runAsync();
  }

  public componentDidMount() {
    this.attachView();
  };

  public componentDidUpdate(prevProps: OwnProps & StateProps) {
    if (prevProps.vegaIsParsing && !this.props.vegaIsParsing) {
      this.attachView();
    }
    if (!prevProps.canDemonstrate && this.props.canDemonstrate) {
      this.onSignal('brush_x', (name, value) => {
        // console.log(name, value)
        // this.view.signal(name, value);
        this.setPreviewSignal(name, value);
      });
      this.onSignal('brush_y', (name, value) => {
        // console.log(name, value)
        // this.view.signal(name, value);
        this.setPreviewSignal(name, value);
      });
    }
    else if (prevProps.canDemonstrate && !this.props.canDemonstrate) {
      this.offSignal('brush_x');
      this.offSignal('brush_y');
    }
  }

  private signalHandlers = {};

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

  private setPreviewSignal(name, value) {
    listeners.setSignalInGroup(this.view, this.props.group, name, value);
  }

  public render() {

    return (
      <div id={this.props.id}></div>
    );
  }

}

export default connect(mapStateToProps)(InteractionPreview);
