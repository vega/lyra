'use strict';

import * as React from 'react';
import {connect} from 'react-redux';
import {State} from '../../store';
import {InteractionRecord, ApplicationRecord, SelectionRecord, ScaleInfo, MarkApplicationRecord, PointSelectionRecord, IntervalSelectionRecord, IntervalSelection, PointSelection, MarkApplication, ScaleApplication, TransformApplication, InteractionInput, InteractionSignal, getInteractionSignals, TransformApplicationRecord, ScaleApplicationRecord} from '../../store/factory/Interaction';
import {GroupRecord} from '../../store/factory/marks/Group';
import {setInput, setSelection, setApplication, removeApplication, setSignals} from '../../actions/interactionActions';
import {getScaleInfoForGroup,  getNestedMarksOfGroup,  getFieldsOfGroup} from '../../ctrl/demonstrations';
import {ScaleSimpleType, scaleTypeSimple} from '../../store/factory/Scale'
import {DatasetRecord} from '../../store/factory/Dataset';
import {InteractionMarkApplicationProperty} from './InteractionMarkApplication';
import {MarkRecord} from '../../store/factory/Mark';
import exportName from '../../util/exportName';
import InteractionPreview from '../interactions/InteractionPreview';
import {Map} from 'immutable';
import {debounce} from 'vega';
import {InteractionInputType} from './InteractionInputType';
import {InteractionSignals} from './InteractionSignals';
import {signalLookup} from '../../util/signal-lookup';
import {batchGroupBy} from '../../reducers/historyOptions';

const ctrl = require('../../ctrl');
const listeners = require('../../ctrl/listeners');

interface OwnProps {
  primId: number;
}

interface OwnState {
  selectionPreviews: SelectionRecord[]
  applicationPreviews: ApplicationRecord[]
}

interface DispatchProps {
  setInput: (input: InteractionInput, id: number) => void;
  setSelection: (record: SelectionRecord, id: number) => void;
  setApplication: (record: ApplicationRecord, id: number) => void;
  setSignals: (signals: InteractionSignal[], id: number) => void;
  removeApplication: (record: ApplicationRecord, id: number) => void;
}

interface StateProps {
  groups: Map<number, GroupRecord>;
  interaction: InteractionRecord;
  scaleInfo: ScaleInfo;
  scaleInfoOfGroups: Map<number, ScaleInfo>;
  datasets: Map<string, DatasetRecord>;
  group: GroupRecord;
  groupName: string;
  marksOfGroups: Map<number, MarkRecord[]>; // map of group ids to array of mark specs
  fieldsOfGroup: string[];
  markScalesOfGroup: MarkScales[];
  canDemonstrate: boolean;
  isDemonstratingInterval: boolean;
}

interface MarkScales {
  mark: MarkRecord;
  xScaleType: ScaleSimpleType;
  yScaleType: ScaleSimpleType;
  scaleFields: string[];
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
    return getNestedMarksOfGroup(state, group);
  });

  const scaleInfoOfGroups: Map<number, ScaleInfo> = groups.map(group => {
    return getScaleInfoForGroup(state, group._id);
  });

  const marksOfGroup = marksOfGroups.get(groupId);

  const datasets: Map<string, DatasetRecord> = state.getIn(['vis', 'present', 'datasets']);

  const fieldsOfGroup = getFieldsOfGroup(state, group._id);

  const isParsing = state.getIn(['vega', 'isParsing']);

  const canDemonstrate = Boolean(!isParsing && ctrl.view && (scaleInfo.xScaleName && scaleInfo.xFieldName || scaleInfo.yScaleName && scaleInfo.yFieldName));

  const isDemonstratingInterval = interaction.input ? interaction.input.mouse === 'drag' : null;

  const markScalesOfGroup = marksOfGroup.map(mark => {
    let xScaleType, yScaleType = null;
    if (mark.encode && mark.encode.update && mark.encode.update.x && (mark.encode.update.x as any).scale) {
      const xScaleId = (mark.encode.update.x as any).scale;
      const xScaleRecord = state.getIn(['vis', 'present', 'scales', String(xScaleId)]);
      xScaleType = scaleTypeSimple(xScaleRecord.get('type'));
    }
    if (mark.encode && mark.encode.update && mark.encode.update.y && (mark.encode.update.y as any).scale) {
      const yScaleId = (mark.encode.update.y as any).scale;
      const yScaleRecord = state.getIn(['vis', 'present', 'scales', String(yScaleId)]);
      yScaleType = scaleTypeSimple(yScaleRecord.get('type'));
    }
    const scaleFields = [];
    if (mark.encode && mark.encode.update && mark.encode.update) {
      for (const [key, value] of Object.entries(mark.encode.update)) {
        if (key === 'x' || key === 'y' || !value) continue;
        const field = (value as any).field;
        if (field) {
          scaleFields.push(field);
        }
      }
    }
    return {
      mark,
      xScaleType,
      yScaleType,
      scaleFields
    }
  });

  return {
    interaction,
    groups,
    scaleInfo,
    scaleInfoOfGroups,
    group,
    groupName,
    datasets,
    marksOfGroups,
    fieldsOfGroup,
    markScalesOfGroup,
    canDemonstrate,
    isDemonstratingInterval
  };
}

const actionCreators: DispatchProps = {setInput, setSelection, setApplication, removeApplication, setSignals};

function generateSelectionPreviews(markScalesOfGroup: MarkScales[], interaction: InteractionRecord, isDemonstratingInterval: boolean): SelectionRecord[] {
  if (isDemonstratingInterval) {
    const defs: IntervalSelectionRecord[] = [];
    const brush = IntervalSelection({
      id: "brush",
      label: "Brush"
    });
    const brush_y = IntervalSelection({
      id: "brush_y",
      label: "Brush (y-axis)",
      encoding: 'y'
    });
    const brush_x = IntervalSelection({
      id: "brush_x",
      label: "Brush (x-axis)",
      encoding: 'x'
    });

    // HEURISTICS: surface different interval selections depending on mark type
    markScalesOfGroup.forEach(markScales => {
      const {mark, xScaleType, yScaleType} = markScales;
      switch (mark.type) {
        case 'rect':
          if (xScaleType === ScaleSimpleType.DISCRETE || yScaleType === ScaleSimpleType.DISCRETE) {
            if (xScaleType === ScaleSimpleType.DISCRETE) {
              defs.push(brush_x);
            }
            if (yScaleType === ScaleSimpleType.DISCRETE) {
              defs.push(brush_y);
            }
          }
          else {
            if (xScaleType === ScaleSimpleType.CONTINUOUS && yScaleType === ScaleSimpleType.CONTINUOUS) defs.push(brush);
            if (yScaleType === ScaleSimpleType.CONTINUOUS) defs.push(brush_y);
            if (xScaleType === ScaleSimpleType.CONTINUOUS) defs.push(brush_x);
          }
          break;
        case 'symbol':
        case 'text':
          if (xScaleType === ScaleSimpleType.CONTINUOUS && yScaleType === ScaleSimpleType.CONTINUOUS) defs.push(brush);
          if (yScaleType === ScaleSimpleType.CONTINUOUS) defs.push(brush_y);
          if (xScaleType === ScaleSimpleType.CONTINUOUS) defs.push(brush_x);
          break;
        case 'line':
          if (yScaleType === ScaleSimpleType.CONTINUOUS) defs.push(brush_y);
          if (xScaleType === ScaleSimpleType.CONTINUOUS) defs.push(brush_x);
          break;
        case 'area':
          const areaMark = mark.toJS();
          const orient = areaMark.encode?.update?.orient;
          const value = orient ? orient.value || signalLookup(orient.signal) : null;
          if (value) {
            // TODO(jzong) what if orient is not in update but is in one of the other ones?
            if (value === 'vertical' && xScaleType) {
              defs.push(brush_x);
            }
            else if (value === 'horizontal' && yScaleType) {
              defs.push(brush_y);
            }
          }
          break;
      }
    });
    return [... new Set(defs)];
  }
  else {
    let field = '_vgsid_';
    if (interaction && interaction.selection) {
      const selection = (interaction.selection as PointSelectionRecord);
      if (selection.field && selection.field !== '_vgsid_') {
        field = selection.field
      }
    }
    if (field === '_vgsid_') {
      const boundFields = new Set<string>();
      markScalesOfGroup.forEach(markScales => {
        markScales.scaleFields.forEach(field => {
          boundFields.add(field);
        })
      });
      if (boundFields.size) {
        field = boundFields.values().next().value;
      }
    }
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
        label: 'Single point (projected)',
        field: field,
        encoding: null
      }),
      PointSelection({
        ptype: 'multi',
        id: 'multi_project',
        label: 'Multi point (projected)',
        field: field,
        encoding: null
      })
    ];
    return defs;
  }
}

function generateApplicationPreviews(groupId: number, groupName: string, marksOfGroup: MarkRecord[], scaleInfo: ScaleInfo, groups: Map<number, GroupRecord>, marksOfGroups: Map<number, MarkRecord[]>, datasets: Map<string, DatasetRecord>, isDemonstratingInterval: boolean): ApplicationRecord[] {
  const defs: ApplicationRecord[] = [];

  if (marksOfGroup.length) {
    const mark = marksOfGroup[0];
    const maybeSymbol = marksOfGroup.find(mark => mark.type === 'symbol');

    defs.push(MarkApplication({
      id: "color_" + isDemonstratingInterval,
      label: "Color",
      targetGroupName: groupName,
      targetMarkName: exportName(mark.name),
      propertyName: mark.type === 'line' ? "stroke" : "fill",
      unselectedValue: "#797979"
    }));
    defs.push(MarkApplication({
      id: "opacity_" + isDemonstratingInterval,
      label: "Opacity",
      targetGroupName: groupName,
      targetMarkName: exportName(mark.name),
      propertyName: "opacity",
      unselectedValue: "0.2"
    }));
    if (maybeSymbol) {
      defs.push(MarkApplication({
        id: "size_" + isDemonstratingInterval,
        label: "Size",
        targetGroupName: groupName,
        targetMarkName: exportName(maybeSymbol.name),
        propertyName: "size",
        unselectedValue: 30
      }));
    }
  }

  if (isDemonstratingInterval) {
    defs.push(ScaleApplication({
      id: "panzoom",
      label: "Pan and zoom",
      targetGroupName: groupName,
      scaleInfo
    }));
  }

  const otherGroup = groups.find(group => group._id !== groupId);
  if (otherGroup) {
    const otherGroupId = otherGroup._id;
    const marksOfOtherGroup = marksOfGroups.get(otherGroupId);
    const mark = marksOfOtherGroup.find(mark => mark.from && mark.from.data); // TODO(jzong): && mark.from.data === mark dataset in current group?
    if (mark) {
      const targetGroupName = exportName(otherGroup.name);
      const targetMarkName = exportName(mark.name);

      const datasetName = datasets.get(String(mark.from.data)).name;

      defs.push(TransformApplication({
        id: "filter_" + targetGroupName + "_" + isDemonstratingInterval,
        label: "Filter",
        targetGroupName,
        datasetName,
        targetMarkName,
      }));
    }
  }
  return defs;
}

class BaseInteractionInspector extends React.Component<OwnProps & StateProps & DispatchProps, OwnState> {

  constructor(props) {
    super(props);

    this.state = {
      selectionPreviews: [],
      applicationPreviews: []
    };
  }

  public componentDidMount() {
    // necessary because state goes away when unmounting (when you close the inspector)
    if (this.props.interaction?.input) {
      const previews = this.generatePreviews(this.props.isDemonstratingInterval);
      this.setState(previews);
    }
  }

  private generatePreviews(isDemonstratingInterval: boolean): {
    selectionPreviews: SelectionRecord[],
    applicationPreviews: ApplicationRecord[]
  } {
    if (isDemonstratingInterval === null) {
      return {
        selectionPreviews: [],
        applicationPreviews: []
      }
    }

    const marksOfGroup = this.props.marksOfGroups.get(this.props.interaction.groupId);

    return {
      selectionPreviews: generateSelectionPreviews(this.props.markScalesOfGroup, this.props.interaction, isDemonstratingInterval),
      applicationPreviews: generateApplicationPreviews(this.props.interaction.groupId, this.props.groupName, marksOfGroup, this.props.scaleInfo, this.props.groups, this.props.marksOfGroups, this.props.datasets, isDemonstratingInterval)
    };
  };

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

      if (this.props.interaction?.signals?.length) {
        this.props.interaction.signals.forEach(s => {
          this.onSignal(this.props.groupName, s.signal, (name, value) => this.updatePreviewSignals(name, value));
        })
      }
    }

    // necessary to handle undo/redo
    if (this.props.interaction?.selection) {
      if (!this.state.selectionPreviews?.find(x => x.id === this.props.interaction.selection.id)) {
        const previews = this.generatePreviews(this.props.isDemonstratingInterval);
        this.setState(previews);
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

  private clearMainViewSignals(groupName) {
    for (let signalName of ['brush_x', 'brush_y', 'points_tuple', 'points_tuple_projected'].map(s => this.scopedSignalName(s))) {
      this.mainViewSignalValues[signalName] = null;
      listeners.setSignalInGroup(ctrl.view, groupName, signalName, null);
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
    this.state.selectionPreviews.forEach(preview => {
      if (this.previewRefs[preview.id]) {
        this.previewRefs[preview.id].setPreviewSignal(name, value);
      }
    });
    this.state.applicationPreviews.forEach(preview => {
      if (this.previewRefs[preview.id]) {
        this.previewRefs[preview.id].setPreviewSignal(name, value);
      }
    });
  }

  private updateIsDemonstrating = debounce(250, () => { // debounce is important
    const intervalActive = (this.mainViewSignalValues[this.scopedSignalName('brush_x')] &&
      this.mainViewSignalValues[this.scopedSignalName('brush_y')] &&
      Math.abs(this.mainViewSignalValues[this.scopedSignalName('brush_x')][0] - this.mainViewSignalValues[this.scopedSignalName('brush_x')][1]) > 10 &&
      Math.abs(this.mainViewSignalValues[this.scopedSignalName('brush_y')][0] - this.mainViewSignalValues[this.scopedSignalName('brush_y')][1]) > 10);
    const pointActive = this.mainViewSignalValues[this.scopedSignalName('points_tuple')] || this.mainViewSignalValues[this.scopedSignalName('points_tuple_projected')];

    const isDemonstratingInterval = intervalActive || this.props.isDemonstratingInterval && !pointActive;

    if (this.props.isDemonstratingInterval !== isDemonstratingInterval) {
      // re-initialize interaction using a demonstration if
      if (!this.props.interaction.selection || // it hasn't been initialized
          (this.state.selectionPreviews.length && this.props.interaction.selection.id === this.state.selectionPreviews[0].id) && !this.props.interaction.applications.length // user hasn't touched the default selection / application
        ) {
        this.initializeInteraction(isDemonstratingInterval ? 'drag' : 'click');
      }
    }
  });

  private initializeInteraction(mouse: InteractionInput['mouse'], didUseDropdown?: boolean) {
    const isDemonstratingInterval = mouse === 'drag';
    const previews = this.generatePreviews(isDemonstratingInterval);
    this.setState(previews);

    if (didUseDropdown) {
      // clear the demonstration signals so that they don't reset the dropdown choice
      this.clearMainViewSignals(this.props.groupName)
    }

    batchGroupBy.start();

    let input = this.props.interaction.input;
    if (!this.props.interaction.input) {
      const inputKeyboard: InteractionInput = (window as any)._inputKeyboard;
      input = {
        mouse,
        keycode: inputKeyboard ? inputKeyboard.keycode : undefined,
        _key: inputKeyboard ? inputKeyboard._key : undefined
      };
    }
    else {
      input = {
        ...this.props.interaction.input,
        mouse,
      }
    }
    this.props.setInput(input, this.props.primId);

    let didHeuristicSetSelection = false;
    if (isDemonstratingInterval) {
      didHeuristicSetSelection = this.updateBrushXYHeuristic();
    }
    else {
      didHeuristicSetSelection = this.updatePointMultiHeuristic();
    }
    if (!didHeuristicSetSelection) this.props.setSelection(previews.selectionPreviews[0], this.props.interaction.id);

    const signals = getInteractionSignals(this.props.interaction.id, input, this.props.scaleInfo, this.props.fieldsOfGroup);
    this.props.setSignals(signals, this.props.interaction.id);

    batchGroupBy.end();
  }

  private updateBrushXYHeuristic() {
    if (this.props.interaction && this.props.interaction.selection) return;
    const brush_x = this.mainViewSignalValues[this.scopedSignalName('brush_x')];
    const brush_y = this.mainViewSignalValues[this.scopedSignalName('brush_y')];
    if (!(brush_x && brush_y)) return;
    const d_brush_x = Math.abs(brush_x[1] - brush_x[0]);
    const d_brush_y = Math.abs(brush_y[1] - brush_y[0]);
    const threshold_distance = 10;
    if (!(Math.sqrt(d_brush_y * d_brush_y + d_brush_x * d_brush_x) > threshold_distance)) return;
    const atan2_degrees = Math.abs(Math.atan2(d_brush_y, d_brush_x)) * 180 / Math.PI;
    const threshold_degrees = 15;
    if (atan2_degrees <= threshold_degrees) {
      const brush_x_selection = this.state.selectionPreviews.find(s => s.id === 'brush_x');
      if (brush_x_selection) {
        this.props.setSelection(brush_x_selection, this.props.interaction.id);
        return true;
      }
    }
    if (atan2_degrees >= 90 - threshold_degrees) {
      const brush_y_selection = this.state.selectionPreviews.find(s => s.id === 'brush_y');
      if (brush_y_selection) {
        this.props.setSelection(brush_y_selection, this.props.interaction.id);
        return true;
      }
    }
  }

  private updatePointMultiHeuristic() {
    if (this.props.interaction && this.props.interaction.selection) return;
    const points_tuple = this.mainViewSignalValues[this.scopedSignalName('points_tuple')];
    if (!(points_tuple && this.previousPointSignal)) return;

    const point_multi_selection = this.state.selectionPreviews.find(s => s.id === 'multi');
    if (point_multi_selection) {
      this.props.setSelection(point_multi_selection, this.props.interaction.id);
      return true;
    }
  }

  // for the purposes of demonstrating multi point selection by quickly clicking multiple points
  private previousPointSignal = null;
  private previousPointSignalTimeout = null;

  private onMainViewPointSignal(name, value) {
    if (this.mainViewSignalValues[name] !== value) {
      if (name.indexOf('points_tuple') >= 0) {
        clearTimeout(this.previousPointSignalTimeout);
        this.previousPointSignal = this.mainViewSignalValues[name];
        this.previousPointSignalTimeout = setTimeout(() => {
          this.previousPointSignal = null;
        }, 800);
      }
      this.mainViewSignalValues[name] = value;
      this.updateIsDemonstrating();
      this.updatePreviewSignals(name, value);
    }
  }

  private onMainViewIntervalSignal(name, value) {
    if (this.mainViewSignalValues[name] !== value) {
      this.mainViewSignalValues[name] = value;
      this.updateIsDemonstrating();
      // TODO: consider adding this.updateBrushXYHeuristic() debounced here
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

  private getProjectionOptions(preview: PointSelectionRecord) {
    const fieldOptions = [
      <option key='_vgsid_' value={'_vgsid_'}>None</option>,
      ...this.props.fieldsOfGroup.map(field => <option key={field} value={field}>{field}</option>)
    ];

    return (
      <div>
        <div className="property">
          <label htmlFor='project_fields'>Field:</label>
          <div className='control'>
            <select name='project_fields' value={preview.field} onChange={e => this.onSelectProjectionField(preview, e.target.value)}>
              {fieldOptions}
            </select>
          </div>
        </div>
        <div className="property">
          <label htmlFor='project_encodings'>Encoding:</label>
          <div className='control'>
            <select name='project_encodings' value={preview.encoding} onChange={e => this.onSelectProjectionEncoding(preview, e.target.value)}>
              <option key='null' value='null'>None</option>
              <option key='x' value='x'>x</option>
              <option key='y' value='y'>y</option>
            </select>
          </div>
        </div>
      </div>
    );
  }
  private onSelectProjectionField(preview: PointSelectionRecord, field: string) {
    const newPreview = preview.set('field', field);
    this.props.setSelection(newPreview, this.props.interaction.id);
  }
  private onSelectProjectionEncoding(preview: PointSelectionRecord, encoding: string) {
    let newPreview;
    switch (encoding) {
      case 'x':
        newPreview = preview.set('encoding', 'x'); break;
      case 'y':
        newPreview = preview.set('encoding', 'y'); break;
      default:
        newPreview = preview.set('encoding', null); break;
    }
    this.props.setSelection(newPreview, this.props.interaction.id);
  }

  private getTargetMarkOptions(preview: MarkApplicationRecord | TransformApplicationRecord) {
    const targetGroupName = preview.targetGroupName;
    const group = this.props.groups.find(group => exportName(group.name) === targetGroupName);
    const marksOfGroup = this.props.marksOfGroups.get(group._id);

    let options;

    if (marksOfGroup.length === 1) {
      options = <div>{marksOfGroup[0].name}</div>
    }
    else {
      options = (
        <select name='target_mark' value={preview.targetMarkName} onChange={e => this.onSelectTargetMarkName(preview, e.target.value)}>
          {
            marksOfGroup.map(mark => {
              if (preview.id.startsWith('size')) {
                if (mark.type !== 'symbol') {
                  return null;
                }
              }
              const markName = exportName(mark.name);
              return <option key={markName} value={markName}>{mark.name}</option>
            })
          }
        </select>
      )
    }

    return (
      <div className="property">
        <label htmlFor='target_mark'>Mark:</label>
        <div className='control'>
          {options}
        </div>
      </div>
    );
  }

  private onSelectTargetMarkName(preview: MarkApplicationRecord | TransformApplicationRecord, targetMarkName: string) {
    let newPreview = (preview as any).set('targetMarkName', targetMarkName);
    if (preview.id.startsWith('color')) {
      const marksOfGroup = this.props.marksOfGroups.get(this.props.group._id);
      const targetMark = marksOfGroup.find(mark => exportName(mark.name) === targetMarkName);
      newPreview = newPreview.set('propertyName', targetMark.type === 'line' ? "stroke" : "fill");
    }
    this.props.setApplication(newPreview, this.props.interaction.id);
  }

  private getTargetGroupOptions(preview: ApplicationRecord) {
    const groups = this.props.groups.valueSeq().toArray().filter(group => {
      if (preview.label === 'Filter' && group._id === this.props.group._id) {
        return false;
      }
      return true;
    });

    let options;

    if (groups.length === 1) {
      options = <div>{groups[0].name}</div>;
    }
    else {
      options = (
        <select name='target_group' value={preview.targetGroupName} onChange={e => this.onSelectTargetGroup(preview, e.target.value)}>
          {
            groups.map(group => {
              const groupName = exportName(group.name);
              return <option key={groupName} value={groupName}>{group.name}</option>
            })
          }
        </select>
      );
    }

    return (
      <div className="property">
        <label htmlFor='target_group'>Group:</label>
        <div className='control'>
          {options}
        </div>
      </div>
    );
  }

  private onSelectTargetGroup(preview: ApplicationRecord, targetGroup: string) {
    let newPreview = (preview as any).set('targetGroupName', targetGroup);
    const group = this.props.groups.find(group => exportName(group.name) == targetGroup);
    const marksOfGroup = this.props.marksOfGroups.get(group._id);
    if (marksOfGroup.length) {
      newPreview = newPreview.set('targetMarkName', exportName(this.props.marksOfGroups.get(group._id)[0].name));
    }
    if ((preview as ScaleApplicationRecord).scaleInfo) {
      newPreview = newPreview.set('scaleInfo', this.props.scaleInfoOfGroups.get(group._id));
    }

    this.props.setApplication(newPreview, this.props.interaction.id);
  }

  public render() {
    const interaction = this.props.interaction;
    const applications = interaction.applications;

    return (
      <div>
        <InteractionInputType interactionId={interaction.id} input={interaction.input} initializeInteraction={(m) => this.initializeInteraction(m, true)}></InteractionInputType>
        {
          interaction.input ? (
            <div>
              <div className={"preview-controller"}>
                <div className='property-group'>
                  <h3>Selections</h3>
                  <div className="preview-scroll">
                    {
                      this.state.selectionPreviews.map((preview) => {
                        return (
                          <div key={preview.id} className={interaction && interaction.selection && interaction.selection.id === preview.id ? 'selected' : ''}
                              onClick={() => this.onClickInteractionPreview(preview)}>
                            <div className="preview-label">{preview.label}</div>
                            <InteractionPreview ref={ref => this.previewRefs[preview.id] = ref}
                              id={`preview-${preview.id}`}
                              interaction={this.props.interaction}
                              groupName={this.props.groupName}
                              applicationPreviews={this.state.applicationPreviews}
                              preview={preview}
                              canDemonstrate={this.props.canDemonstrate}/>
                          </div>
                        )
                      })
                    }
                  </div>
                  {
                    (interaction && interaction.selection && interaction.selection.id.includes('project')) ? (
                      this.getProjectionOptions(interaction.selection as PointSelectionRecord)
                    ) : null
                  }
                </div>
                <div className='property-group'>
                  <h3>Applications</h3>
                  <div className={"preview-scroll " + (this.state.applicationPreviews.length > 4 ? "overflow" : '')}>
                    {
                      this.state.applicationPreviews.map((preview) => {
                        return (
                          <div key={preview.id} className={interaction && this.interactionHasApplication(preview) ? 'selected' : ''}>
                            <div onClick={() => this.onClickInteractionPreview(preview)}>
                              <div className="preview-label">{preview.label}</div>
                            <InteractionPreview ref={ref => this.previewRefs[preview.id] = ref}
                                id={`preview-${preview.id}`}
                                interaction={this.props.interaction}
                                groupName={this.props.groupName}
                                applicationPreviews={this.state.applicationPreviews}
                                preview={preview}
                                canDemonstrate={this.props.canDemonstrate}/>
                            </div>
                          </div>
                        )
                      })
                    }
                  </div>
                  <div className='application-options-wrap'>
                    {
                      applications.map(application => {
                        const targetGroupOptions = application.type === 'scale' ? (<div>{application.targetGroupName}</div>) : this.getTargetGroupOptions(application); // TODO: support scale applications here too
                        const targetMarkOptions = application.type === 'mark' || application.type === 'transform' ? (
                          this.getTargetMarkOptions(application as any)
                        ) : null;
                        const properties = application.type === 'mark' ? (
                          <div>
                            <InteractionMarkApplicationProperty interactionId={interaction.id} markApplication={application as MarkApplicationRecord}></InteractionMarkApplicationProperty>
                          </div>
                        ) : null;

                        return <div className='application-options'>
                          <h5>{application.label}</h5>
                          {targetGroupOptions}
                          {targetMarkOptions}
                          {properties}
                        </div>
                      })
                    }
                  </div>
                </div>
              </div>

              <div className="property-group">
                <h3>Signals</h3>
                <InteractionSignals interactionId={this.props.interaction.id} fieldsOfGroup={this.props.fieldsOfGroup} input={this.props.interaction.input} scaleInfo={this.props.scaleInfo}></InteractionSignals>
              </div>
            </div>
          ) : null
        }
      </div>
    );
  }
};

export const InteractionInspector = connect(mapStateToProps, actionCreators)(BaseInteractionInspector);
