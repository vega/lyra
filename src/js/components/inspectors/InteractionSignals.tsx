'use strict';

import * as React from 'react';
import {connect} from 'react-redux';
import {State} from '../../store';
import {ScaleInfo, InteractionRecord, InteractionInput} from '../../store/factory/Interaction';
import {SignalDraggingState, DraggingStateRecord, SignalDraggingStateRecord} from '../../store/factory/Inspector';
import {MODE, SELECTED, CELL} from '../../store/factory/Signal';
import {startDragging, stopDragging} from '../../actions/inspectorActions';
import {setMarkVisual} from '../../actions/markActions';
import {NumericValueRef, StringValueRef, tupleid} from 'vega';
import sg from '../../ctrl/signals';

const ctrl = require('../../ctrl');

interface OwnProps {
  groupId: number;
  interaction: InteractionRecord;
  scaleInfo: ScaleInfo;
}

interface StateProps {
  dragging: SignalDraggingStateRecord;
}

interface DispatchProps {
  startDragging: (d: DraggingStateRecord) => void;
  stopDragging: () => void;
  setMarkVisual: (payload: {property: string, def: NumericValueRef | StringValueRef}, markId: number) => void;
}


function mapStateToProps(state: State): StateProps {
  const draggingSignal = state.getIn(['inspector', 'dragging']) as SignalDraggingStateRecord;
  const dragging = draggingSignal && draggingSignal.signal ? draggingSignal : null;
  return {
    dragging
  }
}

const actionCreators = {startDragging, stopDragging, setMarkVisual};

class BaseInteractionSignals extends React.Component<OwnProps & StateProps & DispatchProps> {

  constructor(props) {
    super(props);
  }

  private handleDragStart = (evt) => {
    const groupId = this.props.groupId;
    const signal = evt.target.dataset.signal;

    this.props.startDragging(SignalDraggingState({groupId, signal}));

    sg.set(MODE, 'channels');
    ctrl.update();
  }

  private handleDragEnd = () => {
    const sel = sg.get(SELECTED);
    const cell = sg.get(CELL);
    const dropped = tupleid(sel) && tupleid(cell);

    try {
      if (dropped) {
        const lyraId = +sel.mark.role.split('lyra_')[1]; // id of thing that was dropped onto
        const channel: string = cell.key;
        this.props.setMarkVisual(
          {
            property: channel,
            def: {signal: channel === 'text' ? `{{#${this.props.dragging.signal}}}` : this.props.dragging.signal}
          },
          lyraId
        )
      }
    } catch (e) {
      console.error('Unable to bind primitive');
      console.error(e);
    }

    this.props.stopDragging();
    sg.set(MODE, 'handles');
    sg.set(CELL, {});

    if (!dropped) {
      ctrl.update();
    }
  }


  private getSignalBubbles(scaleInfo: ScaleInfo, input: InteractionInput) {
    if (!input) return;
    const {xScaleName, yScaleName} = scaleInfo;
    const interactionId = this.props.interaction.id;

    const signals = [];

    switch (input.mouse) {
      case 'drag':
        if (xScaleName) {
          signals.push(<div draggable className="signal" onDragStart={this.handleDragStart} onDragEnd={this.handleDragEnd} data-signal={`brush_x_start_${interactionId}`}>brush_x (start)</div>)
          signals.push(<div draggable className="signal" onDragStart={this.handleDragStart} onDragEnd={this.handleDragEnd} data-signal={`brush_x_end_${interactionId}`}>brush_x (end)</div>)
        }
        if (yScaleName) {
          signals.push(<div draggable className="signal" onDragStart={this.handleDragStart} onDragEnd={this.handleDragEnd} data-signal={`brush_y_start_${interactionId}`}>brush_y (start)</div>)
          signals.push(<div draggable className="signal" onDragStart={this.handleDragStart} onDragEnd={this.handleDragEnd} data-signal={`brush_y_end_${interactionId}`}>brush_y (end)</div>)
        }
        // TODO create these signals
        // if (xFieldName) {
        //   signals.push(<div draggable className="signal" onDragStart={this.handleDragStart} onDragEnd={this.handleDragEnd} data-signal={`brush_${xFieldName}_${xScaleName}_${interactionId}_start`}>{`brush_${xFieldName} (start)`}</div>)
        //   signals.push(<div draggable className="signal" onDragStart={this.handleDragStart} onDragEnd={this.handleDragEnd} data-signal={`brush_${xFieldName}_${xScaleName}_${interactionId}_end`}>{`brush_${xFieldName} (end)`}</div>)
        // }
        // if (yFieldName) {
        //   signals.push(<div draggable className="signal" onDragStart={this.handleDragStart} onDragEnd={this.handleDragEnd} data-signal={`brush_${yFieldName}_${yScaleName}_${interactionId}_start`}>{`brush_${yFieldName} (start)`}</div>)
        //   signals.push(<div draggable className="signal" onDragStart={this.handleDragStart} onDragEnd={this.handleDragEnd} data-signal={`brush_${yFieldName}_${yScaleName}_${interactionId}_end`}>{`brush_${yFieldName} (end)`}</div>)
        // }
        break;
        case 'click':
          signals.push(<div draggable className="signal" onDragStart={this.handleDragStart} onDragEnd={this.handleDragEnd} data-signal={`lyra_points_tuple_${interactionId}`}>points</div>); // TODO: how do people actually use this?
          break;
        case 'mouseover':
          signals.push(<div draggable className="signal" onDragStart={this.handleDragStart} onDragEnd={this.handleDragEnd} data-signal={`mouse_x_${interactionId}`}>mouse_x</div>);
          signals.push(<div draggable className="signal" onDragStart={this.handleDragStart} onDragEnd={this.handleDragEnd} data-signal={`mouse_y_${interactionId}`}>mouse_y</div>);
          signals.push(<div draggable className="signal" onDragStart={this.handleDragStart} onDragEnd={this.handleDragEnd} data-signal={`lyra_points_tuple_${interactionId}`}>points</div>); // TODO: how do people actually use this?
          break;
    }
    return signals;
  }

  public render() {
    return (
      <div className='signals-container'>
        {this.getSignalBubbles(this.props.scaleInfo, this.props.interaction.input)}
      </div>
    );
  }
};

export const InteractionSignals = connect(mapStateToProps, actionCreators)(BaseInteractionSignals);
