import {Map} from 'immutable';
import * as React from 'react';
import { connect } from 'react-redux';
import {selectScale} from '../../actions/inspectorActions';
import {State} from '../../store';
import {ScaleRecord} from '../../store/factory/Scale';
import sg from '../../ctrl/signals';
import {channelName} from '../../actions/bindChannel';
import {MODE, SELECTED, CELL} from '../../store/factory/Signal';
import {ScaleDraggingState, DraggingStateRecord, ScaleDraggingStateRecord} from '../../store/factory/Inspector';
import {startDragging, stopDragging} from '../../actions/inspectorActions';
import {setMarkVisual} from '../../actions/markActions';
import {NumericValueRef, StringValueRef, tupleid} from 'vega';

const ctrl = require('../../ctrl');

const imutils = require('../../util/immutable-utils');
const getInVis = imutils.getInVis;

interface StateProps {
  selectedId: number;
  scales: Map<string, ScaleRecord>;
  dragging: ScaleDraggingStateRecord;
}

interface DispatchProps {
  selectScale: (id: number) => void;
  startDragging: (d: DraggingStateRecord) => void;
  stopDragging: () => void;
  setMarkVisual: (payload: {property: string, def: NumericValueRef | StringValueRef}, markId: number) => void;
}

function mapStateToProps(reduxState: State, ownProps): StateProps {
  const draggingScale = reduxState.getIn(['inspector', 'dragging']) as ScaleDraggingStateRecord;
  const dragging = draggingScale && draggingScale.scaleId ? draggingScale : null;
  return {
    selectedId: reduxState.getIn(['inspector', 'encodings', 'selectedId']),
    scales: getInVis(reduxState, 'scales'),
    dragging
  };
}

const actionCreators: DispatchProps = {startDragging, stopDragging, selectScale, setMarkVisual};

class ScaleList extends React.Component<StateProps & DispatchProps> {
  private handleDragStart = (evt) => {
    const scaleId = evt.target.dataset.scale;
    const fieldName = evt.target.dataset.field;

    this.props.startDragging(ScaleDraggingState({scaleId, fieldName}));

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
        if (channel === 'x' || 'y') {
          // set scale
          this.props.setMarkVisual(
            {
              property: channel,
              def: {scale: this.props.dragging.scaleId, field: this.props.dragging.fieldName} as any
            },
            lyraId
          )
        }
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
    const props = this.props;
    const scales = [...props.scales.values()]

    return (
      <div id='scale-list'>
        <h2>Scales</h2>
        <ul>
          {scales.map((scale) => {
            const id = scale.get('_id');
            const name = scale.get('name');
            const field = scale.get('_domain') && scale.get('_domain').length ? scale.get('_domain')[0].field : null;


            return (
              <li key={id}
                onClick={props.selectScale.bind(null, id)}>
                <div draggable className={props.selectedId === id ? 'selected scale name' : 'scale name'}
                  onDragStart={this.handleDragStart}
                  onDragEnd={this.handleDragEnd}
                  data-scale={scale.get('_id')}
                  data-field={field}>
                  {/* <ContentEditable value={name} save={updateScaleName}  /> */}
                  {name}
                </div>
              </li>
            );
          }, this)}
        </ul>
      </div>
    );
  }
}

export default connect(mapStateToProps, actionCreators)(ScaleList);
