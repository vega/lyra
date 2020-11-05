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
import {getInteractionSignals, InteractionInput, InteractionSignal, ScaleInfo} from '../../store/factory/Interaction';
import {setSignalPush} from '../../actions/interactionActions';
import {TextRecord} from '../../store/factory/marks/Text';
import {MarkRecord} from '../../store/factory/Mark';
import {Map} from 'immutable';

const ctrl = require('../../ctrl');

interface OwnProps {
  interactionId: number;
  fieldsOfGroup: string[];
  input: InteractionInput;
  scaleInfo: ScaleInfo;
}

interface StateProps {
  dragging: SignalDraggingStateRecord;
  marks: Map<string, MarkRecord>;
}

interface DispatchProps {
  startDragging: (d: DraggingStateRecord) => void;
  stopDragging: () => void;
  setMarkVisual: (payload: {property: string, def: NumericValueRef | StringValueRef}, markId: number) => void;
  setSignalPush: (payload, id) => void;
}


function mapStateToProps(state: State): StateProps {
  const draggingSignal = state.getIn(['inspector', 'dragging']) as SignalDraggingStateRecord;
  const dragging = draggingSignal && draggingSignal.signal ? draggingSignal : null;

  const marks: Map<string, MarkRecord> = state.getIn(['vis', 'present', 'marks']);

  return {
    dragging,
    marks
  }
}

const actionCreators: DispatchProps = {startDragging, stopDragging, setMarkVisual, setSignalPush};

class BaseInteractionSignals extends React.Component<OwnProps & StateProps & DispatchProps> {

  constructor(props) {
    super(props);
  }

  private handleDragStart = (evt) => {
    const interactionId = this.props.interactionId;
    const signal = evt.target.dataset.signal;

    this.props.startDragging(SignalDraggingState({interactionId, signal}));

    sg.set(MODE, 'channels');
    ctrl.update();
  }

  private handleDragEnd = () => {
    const sel = sg.get(SELECTED);
    const cell = sg.get(CELL);
    const dropped = tupleid(sel) && tupleid(cell);

    try {
      if (dropped) {
        this.props.setSignalPush({
          [this.props.dragging.signal]: true
        }, this.props.dragging.interactionId)
        const lyraId = +sel.mark.role.split('lyra_')[1]; // id of thing that was dropped onto
        const channel = channelName(cell.key);
        let value = this.props.dragging.signal;
        if (channel === 'text') {
          // append to current text value if dropping onto a text mark's text channel
          value = `{{#${this.props.dragging.signal}}}`;
          const textRecord: TextRecord = this.props.marks.get(String(lyraId)) as TextRecord;
          const text = textRecord.encode?.update?.text as any;
          if (text) {
            let current = text.signal || text.value || '';
            current = current === 'Text' ? '' : current;
            value = current + value;
          }
        }
        this.props.setMarkVisual(
          {
            property: channel,
            def: {signal: value}
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
    const signals = getInteractionSignals(this.props.interactionId, this.props.input, this.props.scaleInfo, this.props.fieldsOfGroup);
    return (
      <div className='signals-container'>
        {
          signals.map((interactionSignal) => {
            return (<div draggable className="signal" onDragStart={this.handleDragStart} onDragEnd={this.handleDragEnd} data-signal={interactionSignal.signal}>{interactionSignal.label}</div>)
          })
        }
      </div>
    );
  }
};

export const InteractionSignals = connect(mapStateToProps, actionCreators)(BaseInteractionSignals);
