'use strict';

import * as React from 'react';
import {connect} from 'react-redux';
import {State} from '../../store';
import {InteractionRecord, ApplicationRecord, SelectionRecord, ScaleInfo, MarkApplicationRecord, PointSelectionRecord, IntervalSelectionRecord, IntervalSelection, PointSelection, MarkApplication, ScaleApplication, TransformApplication, InteractionInput} from '../../store/factory/Interaction';
import {GroupRecord} from '../../store/factory/marks/Group';
import {setInput, setSelection, setApplication, removeApplication} from '../../actions/interactionActions';
import {getScaleInfoForGroup, ScaleSimpleType} from '../../ctrl/demonstrations';
import {DatasetRecord} from '../../store/factory/Dataset';
import {InteractionMarkApplicationProperty} from './InteractionMarkApplication';
import {MarkRecord, LyraMarkType} from '../../store/factory/Mark';
import exportName from '../../util/exportName';
import InteractionPreview from '../interactions/InteractionPreview';
import {Map} from 'immutable';
import {DraggingStateRecord, SignalDraggingState, SignalDraggingStateRecord} from '../../store/factory/Inspector';
import {startDragging, stopDragging} from '../../actions/inspectorActions';
import {setMarkVisual} from '../../actions/markActions';
import sg from '../../ctrl/signals';
import {CELL, MODE, SELECTED} from '../../store/factory/Signal';
import {NumericValueRef, StringValueRef} from 'vega';
import * as vega from 'vega';
import {debounce} from 'vega';
import {InteractionInputType} from './InteractionInputType';

const ctrl = require('../../ctrl');
const listeners = require('../../ctrl/listeners');
const tupleid = (vega as any).tupleid; // TODO: remove when vega/vega#1947 is merged.

interface OwnProps {
  primId: number;
}

interface DispatchProps {
  setInput: (input: InteractionInput, id: number) => void;
  setSelection: (record: SelectionRecord, id: number) => void;
  setApplication: (record: ApplicationRecord, id: number) => void;
  removeApplication: (record: ApplicationRecord, id: number) => void;
  startDragging: (d: DraggingStateRecord) => void;
  stopDragging: () => void;
  setMarkVisual: (payload: {property: string, def: NumericValueRef | StringValueRef}, markId: number) => void;
}

interface StateProps {
  groups: Map<number, GroupRecord>;
  interaction: InteractionRecord;
  scaleInfo: ScaleInfo;
  datasets: Map<string, DatasetRecord>;
  group: GroupRecord;
  groupName: string;
  marksOfGroups: Map<number, MarkRecord[]>; // map of group ids to array of mark specs
  fieldsOfGroup: string[];
  canDemonstrate: boolean;
  selectionPreviews: SelectionRecord[];
  applicationPreviews: ApplicationRecord[];
  isDemonstratingInterval: boolean;
  dragging: SignalDraggingStateRecord;
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  const interaction: InteractionRecord = state.getIn(['vis', 'present', 'interactions',  String(ownProps.primId)]);
  const groupId = interaction.get('groupId');
  const scaleInfo: ScaleInfo = getScaleInfoForGroup(state, groupId);
  const group: GroupRecord = state.getIn(['vis', 'present', 'marks', String(groupId)]);
  const groupName = exportName(group.name);

  const marks: Map<string, MarkRecord> = state.getIn(['vis', 'present', 'marks']);
  const groups: Map<number, GroupRecord> = marks.filter((mark: MarkRecord) => {
    return mark.type === 'group';
  }).mapEntries(([k, v]) => {
    return [Number(k), v as GroupRecord];
  });

  const marksOfGroups: Map<number, MarkRecord[]> = groups.map(group => {
    return group.marks.map(markId => {
      return state.getIn(['vis', 'present', 'marks', String(markId)]);
    }).filter((mark) => {
      return !(mark.type === 'group' || mark.name.indexOf('lyra') === 0);
    });
  });

  const marksOfGroup = marksOfGroups.get(groupId);

  const datasets: Map<string, DatasetRecord> = state.getIn(['vis', 'present', 'datasets']);

  let fieldsOfGroup = [];
  if (marksOfGroup.length && marksOfGroup[0].from && marksOfGroup[0].from.data) {
    const dsId = String(marksOfGroup[0].from.data);
    const dataset: DatasetRecord =  datasets.get(dsId);
    const schema = dataset.get('_schema');
    const fields = schema.keySeq().toArray();
    fieldsOfGroup = fields;
  }
  const isParsing = state.getIn(['vega', 'isParsing']);

  const canDemonstrate = Boolean(!isParsing && ctrl.view && (scaleInfo.xScaleName && scaleInfo.xFieldName || scaleInfo.yScaleName && scaleInfo.yFieldName));

  const isDemonstratingInterval = interaction.input ? interaction.input.mouse === 'drag' : null;

  const {
    selectionPreviews,
    applicationPreviews,
  } = generatePreviews(groupId, scaleInfo, fieldsOfGroup, groups, marksOfGroups, datasets, interaction, isDemonstratingInterval);

  const draggingSignal = state.getIn(['inspector', 'dragging']) as SignalDraggingStateRecord;
  const dragging = draggingSignal && draggingSignal.signal ? draggingSignal : null;

  return {
    interaction,
    groups,
    scaleInfo,
    group,
    groupName,
    datasets,
    marksOfGroups,
    fieldsOfGroup,
    canDemonstrate,
    selectionPreviews,
    applicationPreviews,
    isDemonstratingInterval,
    dragging
  };
}

const actionCreators = {setInput, setSelection, setApplication, removeApplication, startDragging, stopDragging, setMarkVisual};

function generatePreviews(groupId, scaleInfo, fieldsOfGroup, groups, marksOfGroups, datasets, interaction, isDemonstratingInterval): {
  selectionPreviews: SelectionRecord[],
  applicationPreviews: ApplicationRecord[]
} {
  if (isDemonstratingInterval === null) {
    return {
      selectionPreviews: [],
      applicationPreviews: []
    }
  }

  const marksOfGroup = marksOfGroups.get(groupId);

  return { // TODO maybe memoize these calls or something? also memoize the signal setters
    selectionPreviews: generateSelectionPreviews(marksOfGroup, scaleInfo, fieldsOfGroup, interaction, isDemonstratingInterval),
    applicationPreviews: generateApplicationPreviews(groupId, marksOfGroup, scaleInfo, groups, marksOfGroups, datasets, isDemonstratingInterval)
  };
};

function generateSelectionPreviews(marksOfGroup: MarkRecord[], scaleInfo: ScaleInfo, fieldsOfGroup: string[], interaction: InteractionRecord, isDemonstratingInterval: boolean): SelectionRecord[] {
  if (isDemonstratingInterval) {
    const defs: IntervalSelectionRecord[] = [];
    const brush = IntervalSelection({
      id: "brush",
      label: "Brush",
      field: 'xy'
    });
    const brush_y = IntervalSelection({
      id: "brush_y",
      label: "Brush (y-axis)",
      field: 'y'
    });
    const brush_x = IntervalSelection({
      id: "brush_x",
      label: "Brush (x-axis)",
      field: 'x'
    });

    // HEURISTICS: surface different interval selections depending on mark type
    const markTypes: Set<LyraMarkType> = new Set(marksOfGroup.map((mark) => mark.type));
    if (markTypes.has('symbol')) {
      if (scaleInfo.xScaleType && scaleInfo.yScaleType) defs.push(brush);
      if (scaleInfo.yScaleType) defs.push(brush_y);
      if (scaleInfo.xScaleType) defs.push(brush_x);
    }
    if (markTypes.has('rect')) {
      if (scaleInfo.xScaleType === ScaleSimpleType.DISCRETE) {
        defs.push(brush_x);
      }
      if (scaleInfo.yScaleType === ScaleSimpleType.DISCRETE) {
        defs.push(brush_y);
      }
    }
    if (markTypes.has('area')) {
      const areaMark = marksOfGroup.find(mark => mark.type === 'area').toJS();
      if (areaMark.encode && areaMark.encode.update && areaMark.encode.update.orient && areaMark.encode.update.orient.value) {
        // TODO(jzong) what if orient is not in update but is in one of the other ones?
        if (areaMark.encode.update.orient.value === 'vertical' && scaleInfo.xScaleType) {
          defs.push(brush_x);
        }
        else if (areaMark.encode.update.orient.value === 'horizontal' && scaleInfo.yScaleType) {
          defs.push(brush_y);
        }
      }
    }
    if (markTypes.has('line')) {
      // TODO(jzong) ?
    }
    return [... new Set(defs)];
  }
  else {
    const defs: PointSelectionRecord[] = [
      PointSelection({
        ptype: 'single',
        id: 'single',
        label: 'Single point',
        field: '_vgsid_'
      }),
      PointSelection({
        ptype: 'multi',
        id: 'multi',
        label: 'Multi point',
        field: '_vgsid_'
      }),
      PointSelection({
        ptype: 'single',
        id: 'single_project',
        label: 'Single point (by field)',
        field: interaction && interaction.selection && interaction.selection.field && interaction.selection.field !== '_vgsid_' ? interaction.selection.field : fieldsOfGroup[0]
      }),
      PointSelection({
        ptype: 'multi',
        id: 'multi_project',
        label: 'Multi point (by field)',
        field: interaction && interaction.selection && interaction.selection.field && interaction.selection.field !== '_vgsid_' ? interaction.selection.field : fieldsOfGroup[0]
      })
    ];
    return defs;
  }
}

function generateApplicationPreviews(groupId: number, marksOfGroup: MarkRecord[], scaleInfo: ScaleInfo, groups: Map<number, GroupRecord>, marksOfGroups: Map<number, MarkRecord[]>, datasets: Map<string, DatasetRecord>, isDemonstratingInterval: boolean): ApplicationRecord[] {
  const defs: ApplicationRecord[] = [];

  // TODO(jzong): could add a heuristic -- better way to sort these?
  if (marksOfGroup.length) {
    const mark = marksOfGroup[0];
    defs.push(MarkApplication({
      id: "color_" + isDemonstratingInterval,
      label: "Color",
      targetMarkName: exportName(mark.name),
      propertyName: "fill",
      defaultValue: "#797979"
    }));
    defs.push(MarkApplication({
      id: "opacity_" + isDemonstratingInterval,
      label: "Opacity",
      targetMarkName: exportName(mark.name),
      propertyName: "opacity",
      defaultValue: "0.2"
    }));
    if (mark.type === 'symbol') {
      defs.push(MarkApplication({
        id: "size_" + isDemonstratingInterval,
        label: "Size",
        targetMarkName: exportName(mark.name),
        propertyName: "size",
        defaultValue: 30
      }));
    }
  }

  if (isDemonstratingInterval) {
    defs.push(ScaleApplication({
      id: "panzoom",
      label: "Pan and zoom",
      scaleInfo
    }));
  }

  const otherGroups = groups.filter(group => group._id !== groupId);
  otherGroups.forEach(otherGroup => {
    const otherGroupId = otherGroup._id;
    const marksOfOtherGroup = marksOfGroups.get(otherGroupId);
    const mark = marksOfOtherGroup.find(mark => mark.from && mark.from.data);
    if (mark) {
      const targetGroupName = exportName(otherGroup.name);
      const targetMarkName = exportName(mark.name);

      const datasetName = datasets.get(String(mark.from.data)).name;

      defs.push(TransformApplication({
        id: "filter_" + targetGroupName + "_" + isDemonstratingInterval,
        label: "Filter " + otherGroup.name,
        targetGroupName,
        datasetName,
        targetMarkName,
      }));
    }
  });

  return defs;
}

class BaseInteractionInspector extends React.Component<OwnProps & StateProps & DispatchProps> {

  public componentDidUpdate(prevProps: OwnProps & StateProps, prevState) {
    if (!prevProps.canDemonstrate && this.props.canDemonstrate) {
      this.restoreMainViewSignals(this.props.groupName);
      this.restorePreviewSignals();

      this.onSignal(this.props.groupName, this.scopedSignalName('points_tuple'), (name, value) => this.onMainViewPointSignal(name, value));
      this.onSignal(this.props.groupName, this.scopedSignalName('points_tuple_projected'), (name, value) => this.onMainViewPointSignal(name, value));
      this.onSignal(this.props.groupName, this.scopedSignalName('points_toggle'), (name, value) => this.onMainViewPointSignal(name, value));
      this.onSignal(this.props.groupName, this.scopedSignalName('brush_x'), (name, value) => this.onMainViewIntervalSignal(name, value));
      this.onSignal(this.props.groupName, this.scopedSignalName('brush_y'), (name, value) => this.onMainViewIntervalSignal(name, value));
      this.onSignal(this.props.groupName, this.scopedSignalName('grid_translate_anchor'), (name, value) => this.onMainViewGridSignal(name, value));
      this.onSignal(this.props.groupName, this.scopedSignalName('grid_translate_delta'), (name, value) => this.onMainViewGridSignal(name, value));
    }

    if (prevProps.selectionPreviews !== this.props.selectionPreviews && this.props.selectionPreviews.length) {
      const selectionIds = this.props.selectionPreviews.map(s => s.id);
      if (!this.props.interaction.selection ||
          selectionIds.every(id => id !== this.props.interaction.selection.id)) {
            this.props.setSelection(this.props.selectionPreviews[0], this.props.interaction.id);
      }
    }
  }

  private scopedSignalName(signalName: string) {
    return `${signalName}_${this.props.interaction.id}`
  }

  private restoreMainViewSignals(groupName) {
    for (let signalName of ['brush_x', 'brush_y', 'points_tuple', 'points_tuple_projected'].map(s => this.scopedSignalName(s))) {
      if (this.mainViewSignalValues[signalName]) {
        listeners.setSignalInGroup(ctrl.view, groupName, signalName, this.mainViewSignalValues[signalName]);
      }
    }
  }

  private restorePreviewSignals() {
    for (let signalName of ['brush_x', 'brush_y', 'points_tuple', 'points_tuple_projected'].map(s => this.scopedSignalName(s))) {
      if (this.mainViewSignalValues[signalName]) {
        setTimeout(() => {
          this.updatePreviewSignals(signalName, this.mainViewSignalValues[signalName]);
        }, 50);
        // somehow it only works if you have both of these??? some kind of vega invalidation thing
        this.updatePreviewSignals(signalName, this.mainViewSignalValues[signalName]);
      }
    }
  }

  private previewRefs = {}; // id -> ref
  private mainViewSignalValues = {}; // name -> value

  private updatePreviewSignals(name, value) {
    this.props.selectionPreviews.forEach(preview => {
      if (this.previewRefs[preview.id]) {
        this.previewRefs[preview.id].setPreviewSignal(name, value);
      }
    });
    this.props.applicationPreviews.forEach(preview => {
      if (this.previewRefs[preview.id]) {
        this.previewRefs[preview.id].setPreviewSignal(name, value);
      }
    });
  }
  private updateIsDemonstrating = debounce(250, () => { // debounce is important
    const intervalActive = (this.mainViewSignalValues[this.scopedSignalName('brush_x')] &&
      this.mainViewSignalValues[this.scopedSignalName('brush_y')] &&
      this.mainViewSignalValues[this.scopedSignalName('brush_x')][0] !== this.mainViewSignalValues[this.scopedSignalName('brush_x')][1] &&
      this.mainViewSignalValues[this.scopedSignalName('brush_y')][0] !== this.mainViewSignalValues[this.scopedSignalName('brush_y')][1]);
    const pointActive = this.mainViewSignalValues[this.scopedSignalName('points_tuple')] || this.mainViewSignalValues[this.scopedSignalName('points_tuple_projected')];

    const isDemonstratingInterval = intervalActive || !pointActive;

    if (this.props.isDemonstratingInterval !== isDemonstratingInterval) {
      if (!this.props.interaction.input) {
        const inputKeyboard: InteractionInput = (window as any)._inputKeyboard;
        this.props.setInput({
          mouse: isDemonstratingInterval ? 'drag' : 'click',
          keycode: inputKeyboard ? inputKeyboard.keycode : undefined,
          _key: inputKeyboard ? inputKeyboard._key : undefined
        }, this.props.primId);
      }
      else {
        if ((!this.props.interaction.selection || (this.props.selectionPreviews.length && this.props.interaction.selection.id === this.props.selectionPreviews[0].id)) && !this.props.interaction.applications.length) {
          this.props.setInput({
            ...this.props.interaction.input,
            mouse: isDemonstratingInterval ? 'drag' : 'click',
          }, this.props.primId);
        }
      }
    }
  });

  private onMainViewPointSignal(name, value) {
    if (this.mainViewSignalValues[name] !== value) {
      this.mainViewSignalValues[name] = value;
      this.updateIsDemonstrating();
      this.updatePreviewSignals(name, value);
    }
  }

  private onMainViewIntervalSignal(name, value) {
    if (this.mainViewSignalValues[name] !== value) {
      this.mainViewSignalValues[name] = value;
      this.updateIsDemonstrating();
      this.updatePreviewSignals(name, value);
    }
  }

  private onMainViewGridSignal(name, value) {
    this.mainViewSignalValues[name] = value;
    this.updatePreviewSignals(name, value);
  }

  private onSignal(groupName, signalName, handler) {
    listeners.onSignalInGroup(ctrl.view, groupName, signalName, handler);
  }

  private onClickInteractionPreview(preview: SelectionRecord | ApplicationRecord) {
    switch (preview.type) {
      case 'point':
      case 'interval':
        if (this.props.interaction) {
          this.props.setSelection(preview as SelectionRecord, this.props.interaction.id);
        }
        break;
      case 'mark':
      case 'scale':
      case 'transform':
        if (this.props.interaction) {
          preview = preview as ApplicationRecord;
          if (this.interactionHasApplication(preview)) {
            this.props.removeApplication(preview, this.props.interaction.id);
          }
          else {
            this.props.setApplication(preview, this.props.interaction.id);
          }
        }
        break;
    }
  }

  private interactionHasApplication(preview: ApplicationRecord) {
    return this.props.interaction.applications.some(application => application.id === preview.id);
  }

  private getFieldOptions(preview: PointSelectionRecord) {
    const options = this.props.fieldsOfGroup.map(field => <option key={field} value={field}>{field}</option>);

    return (
      <div className="property">
        <label htmlFor='project_fields'>Field:</label>
        <div className='control'>
          <select name='project_fields' value={preview.field} onChange={e => this.onSelectProjectionField(preview, e.target.value)}>
            {options}
          </select>
        </div>
      </div>
    );
  }
  private onSelectProjectionField(preview: PointSelectionRecord, field: string) {
    const newPreview = preview.set('field', field);
    this.props.setSelection(newPreview, this.props.interaction.id);
  }

  private getTargetMarkOptions(preview: MarkApplicationRecord) {
    const marksOfGroup = this.props.marksOfGroups.get(this.props.group._id);

    if (marksOfGroup.length === 1) {
      return null;
    }

    const options = marksOfGroup.map(mark => {
      const markName = exportName(mark.name);
      return <option key={markName} value={markName}>{markName}</option>
    });

    return (
      <div className="property">
        <label htmlFor='target_mark'>Target Mark:</label>
        <div className='control'>
          <select name='target_mark' value={preview.targetMarkName} onChange={e => this.onSelectTargetMarkName(preview, e.target.value)}>
            {options}
          </select>
        </div>
      </div>
    );
  }

  private onSelectTargetMarkName(preview: MarkApplicationRecord, targetMarkName: string) {
    const newPreview = preview.set('targetMarkName', targetMarkName);
    this.props.setApplication(newPreview, this.props.interaction.id);
  }
  private getSignalBubbles(scaleInfo: ScaleInfo, input: InteractionInput) {
    if (!input) return;
    const {xScaleName, yScaleName, xFieldName, yFieldName} = scaleInfo;

    const signals = [];

    const handleDragStart = (evt) => {
      const groupId = this.props.group._id;
      const signal = evt.target.dataset.signal;

      this.props.startDragging(SignalDraggingState({groupId, signal}));

      sg.set(MODE, 'channels');
      ctrl.update();
    }

    const handleDragEnd = () => {
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

    const interactionId = this.props.interaction.id;

    switch (input.mouse) {
      case 'drag':
        if (xScaleName) {
          signals.push(<div draggable className="signal" onDragStart={handleDragStart} onDragEnd={handleDragEnd} data-signal={`brush_x_start_${interactionId}`}>brush_x (start)</div>)
          signals.push(<div draggable className="signal" onDragStart={handleDragStart} onDragEnd={handleDragEnd} data-signal={`brush_x_end_${interactionId}`}>brush_x (end)</div>)
        }
        if (yScaleName) {
          signals.push(<div draggable className="signal" onDragStart={handleDragStart} onDragEnd={handleDragEnd} data-signal={`brush_y_start_${interactionId}`}>brush_y (start)</div>)
          signals.push(<div draggable className="signal" onDragStart={handleDragStart} onDragEnd={handleDragEnd} data-signal={`brush_y_end_${interactionId}`}>brush_y (end)</div>)
        }
        // TODO create these signals
        // if (xFieldName) {
        //   signals.push(<div draggable className="signal" onDragStart={handleDragStart} onDragEnd={handleDragEnd} data-signal={`brush_${xFieldName}_${xScaleName}_${interactionId}_start`}>{`brush_${xFieldName} (start)`}</div>)
        //   signals.push(<div draggable className="signal" onDragStart={handleDragStart} onDragEnd={handleDragEnd} data-signal={`brush_${xFieldName}_${xScaleName}_${interactionId}_end`}>{`brush_${xFieldName} (end)`}</div>)
        // }
        // if (yFieldName) {
        //   signals.push(<div draggable className="signal" onDragStart={handleDragStart} onDragEnd={handleDragEnd} data-signal={`brush_${yFieldName}_${yScaleName}_${interactionId}_start`}>{`brush_${yFieldName} (start)`}</div>)
        //   signals.push(<div draggable className="signal" onDragStart={handleDragStart} onDragEnd={handleDragEnd} data-signal={`brush_${yFieldName}_${yScaleName}_${interactionId}_end`}>{`brush_${yFieldName} (end)`}</div>)
        // }
        break;
        case 'click':
          signals.push(<div draggable className="signal" onDragStart={handleDragStart} onDragEnd={handleDragEnd} data-signal={`lyra_points_tuple_${interactionId}`}>points</div>); // TODO: how do people actually use this?
          break;
        case 'mouseover':
          signals.push(<div draggable className="signal" onDragStart={handleDragStart} onDragEnd={handleDragEnd} data-signal={`mouse_x_${interactionId}`}>mouse_x</div>);
          signals.push(<div draggable className="signal" onDragStart={handleDragStart} onDragEnd={handleDragEnd} data-signal={`mouse_y_${interactionId}`}>mouse_y</div>);
          signals.push(<div draggable className="signal" onDragStart={handleDragStart} onDragEnd={handleDragEnd} data-signal={`lyra_points_tuple_${interactionId}`}>points</div>); // TODO: how do people actually use this?
          break;
    }
    return signals;
  }

  public render() {
    const interaction = this.props.interaction;
    const applications = interaction.applications;

    return (
      <div>
        <InteractionInputType interactionId={interaction.id} input={interaction.input}></InteractionInputType>
        {
          interaction.input ? (
            <div>
              <div className={"preview-controller"}>
                <div className='property-group'>
                  <h3>Selections</h3>
                  <div className="preview-scroll">
                    {
                      this.props.selectionPreviews.map((preview) => {
                        return (
                          <div key={preview.id} className={interaction && interaction.selection && interaction.selection.id === preview.id ? 'selected' : ''}
                              onClick={() => this.onClickInteractionPreview(preview)}>
                            <div className="preview-label">{preview.label}</div>
                            <InteractionPreview ref={ref => this.previewRefs[preview.id] = ref}
                              id={`preview-${preview.id}`}
                              interaction={this.props.interaction}
                              groupName={this.props.groupName}
                              applicationPreviews={this.props.applicationPreviews}
                              preview={preview}/>
                          </div>
                        )
                      })
                    }
                  </div>
                  {
                    (interaction && interaction.selection && interaction.selection.id.includes('project')) ? (
                      this.getFieldOptions(interaction.selection as PointSelectionRecord)
                    ) : null
                  }
                </div>
                <div className='property-group'>
                  <h3>Applications</h3>
                  <div className="preview-scroll">
                    {
                      this.props.applicationPreviews.map((preview) => {
                        return (
                          <div key={preview.id} className={interaction && this.interactionHasApplication(preview) ? 'selected' : ''}>
                            <div onClick={() => this.onClickInteractionPreview(preview)}>
                              <div className="preview-label">{preview.label}</div>
                            <InteractionPreview ref={ref => this.previewRefs[preview.id] = ref}
                                id={`preview-${preview.id}`}
                                interaction={this.props.interaction}
                                groupName={this.props.groupName}
                                applicationPreviews={this.props.applicationPreviews}
                                preview={preview}/>
                            </div>
                          </div>
                        )
                      })
                    }
                  </div>
                  {
                    applications.map(application => {
                      return application.type === 'mark' ? (
                        <div>
                          {this.getTargetMarkOptions(application as MarkApplicationRecord)}
                          <InteractionMarkApplicationProperty interactionId={interaction.id} groupId={interaction.groupId} markApplication={application as MarkApplicationRecord}></InteractionMarkApplicationProperty>
                        </div>
                      ) : null
                    })
                  }
                </div>
              </div>
              <div className="property-group">
                <h3>Signals</h3>
                <div className='signals-container'>
                  {this.getSignalBubbles(this.props.scaleInfo, interaction.input)}
                </div>
              </div>
            </div>
          ) : null
        }
      </div>
    );
  }
};

export const InteractionInspector = connect(mapStateToProps, actionCreators)(BaseInteractionInspector);
