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
import { startDragging, stopDragging, selectMark} from '../../actions/inspectorActions';
import {setMarkVisual} from '../../actions/markActions';
import {NumericValueRef, StringValueRef, tupleid} from 'vega';
import { deleteScale } from '../../actions/scaleActions';
import { Icon } from '../Icon';
import ReactTooltip from 'react-tooltip';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';

const ctrl = require('../../ctrl');

const imutils = require('../../util/immutable-utils');
const getInVis = imutils.getInVis;
const assets = require('../../util/assets');
const capitalize = require('capitalize');

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
  deleteScale: (_: any, id: number, evt: any) => void;
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

function mapDispatchToProps(dispatch: ThunkDispatch<State, null, AnyAction>): DispatchProps {
  return {
    startDragging: function (d) {
      dispatch(startDragging(d));
    },
    stopDragging: function () {
      dispatch(stopDragging());
    },
    selectScale: function (guideId) {
      dispatch(selectScale(guideId));
    },
    setMarkVisual: function (payload, markId) {
      dispatch(setMarkVisual(payload, markId));
    },
    deleteScale: function (selectedId, scaleId, evt) {
      dispatch(deleteScale(null, scaleId));
      evt.preventDefault();
      evt.stopPropagation();
      ReactTooltip.hide();
    },
  };
}

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

  public componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  public render() {
    const props = this.props;
    const scales = [...props.scales.values()]

    return (
      <div id='scale-list' className="expandingMenu">
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
                  <div style={{ "marginLeft": "26px" }}>
                    {capitalize(name)}
                  </div>
                  <Icon glyph={assets.trash} className='delete'
                    onClick={props.deleteScale.bind(null, props.selectedId, id)}
                    data-tip={'Delete ' + name + ' scale'} data-place='right'/>
                </div>
              </li>
            );
          }, this)}
        </ul>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ScaleList);
