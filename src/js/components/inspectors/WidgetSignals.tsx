'use strict';

import * as React from 'react';
import {connect} from 'react-redux';
import {State} from '../../store';
import {SignalDraggingState, DraggingStateRecord, SignalDraggingStateRecord} from '../../store/factory/Inspector';
import {MODE, SELECTED, CELL} from '../../store/factory/Signal';
import {startDragging, stopDragging} from '../../actions/inspectorActions';
import {setMarkVisual} from '../../actions/markActions';
import {NumericValueRef, StringValueRef, tupleid} from 'vega';
import sg from '../../ctrl/signals';
import {channelName} from '../../actions/bindChannel';
import {InteractionSignal} from '../../store/factory/Interaction';

const ctrl = require('../../ctrl');

interface OwnProps {
  widgetId: number;
  signals: InteractionSignal[];
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

const actionCreators: DispatchProps = {startDragging, stopDragging, setMarkVisual};

class BaseWidgetSignals extends React.Component<OwnProps & StateProps & DispatchProps> {

  constructor(props) {
    super(props);
  }

  private handleDragStart = (evt) => {
    const signal = evt.target.dataset.signal;

    this.props.startDragging(SignalDraggingState({signal})); // TODO(jzong) this is a problem, too much duplication between interactions/widgets

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
        const channel = channelName(cell.key);
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

  public render() {
    return (
      <div className='signals-container'>
        {
          this.props.signals.map((interactionSignal) => {
            return (<div draggable className="signal" onDragStart={this.handleDragStart} onDragEnd={this.handleDragEnd} data-signal={interactionSignal.signal}>{interactionSignal.label}</div>)
          })
        }
      </div>
    );
  }
};

export const WidgetSignals = connect(mapStateToProps, actionCreators)(BaseWidgetSignals);
