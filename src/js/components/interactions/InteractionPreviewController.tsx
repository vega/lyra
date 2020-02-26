import * as React from 'react';
import {Map} from 'immutable';
import { connect } from 'react-redux';
import {State} from '../../store';
import {getScaleInfoForGroup, ScaleSimpleType} from '../../ctrl/demonstrations';
import {Interaction, ApplicationRecord, ScaleInfo, PointSelectionRecord, IntervalSelectionRecord, SelectionRecord, IntervalSelection, PointSelection, MarkApplication, ScaleApplication, TransformApplication} from '../../store/factory/Interaction';
import {Dispatch} from 'redux';
import {addInteraction, setSelection, setApplication} from '../../actions/interactionActions';
import {GroupRecord} from '../../store/factory/marks/Group';
import exportName from '../../util/exportName';
import {addInteractionToGroup} from '../../actions/bindChannel/helperActions';
import {LyraMarkType, MarkRecord} from '../../store/factory/Mark';
import {selectInteraction} from '../../actions/inspectorActions';
import {DatasetRecord} from '../../store/factory/Dataset';
import {InteractionPreview} from './InteractionPreview';
import { debounce } from "throttle-debounce";

const ctrl = require('../../ctrl');
const listeners = require('../../ctrl/listeners');

interface StateProps {
  groups: Map<number, GroupRecord>;
  scaleInfoForGroups: Map<number, ScaleInfo>; // map of group ids to scale info
  marksOfGroups: Map<number, MarkRecord[]>; // map of group ids to array of mark specs
  fieldsOfGroups: Map<number, string[]>; // map of group ids to array of fields
  canDemonstrateGroups: Map<number, Boolean>;
  datasets: Map<string, DatasetRecord>;
  // canDemonstrate: boolean;
  // groupRecord: GroupRecord;
  // marksOfGroup: any[];
  // groupName: string;
  // interactionRecord: InteractionRecord;
  // scaleInfo: ScaleInfo;

}

interface DispatchProps {
  addInteraction: (groupId: number) => number; // return id of newly created interaction
  setSelection: (def: any, id: number) => void;
  setApplication: (def: any, id: number) => void;
  selectInteraction: (id: number) => void;
}

interface OwnState {
  groupId: number; // active group (the one that the user is demonstrating on)
  groupName: string; // active group (the one that the user is demonstrating on)
  isDemonstratingInterval: boolean,
  selectionPreviews: SelectionRecord[];
  applicationPreviews: ApplicationRecord[];
}

function mapStateToProps(state: State): StateProps {
  const marks: Map<string, MarkRecord> = state.getIn(['vis', 'present', 'marks']);
  const groups: Map<number, GroupRecord> = marks.filter((mark: MarkRecord) => {
    return mark.type === 'group';
  }).mapEntries(([k, v]) => {
    return [Number(k), v as GroupRecord];
  });

  const scaleInfoForGroups: Map<number, ScaleInfo> = groups.map((group) => {
    return getScaleInfoForGroup(state, group._id);
  });

  const isParsing = state.getIn(['vega', 'isParsing']);

  const canDemonstrateGroups: Map<number, Boolean> = Map(scaleInfoForGroups.map((scaleInfo) => {
    return Boolean(!isParsing && ctrl.view && (scaleInfo.xScaleName && scaleInfo.xFieldName || scaleInfo.yScaleName && scaleInfo.yFieldName));
  }));

  // const canDemonstrate = Boolean(!isParsing && ctrl.view && (scaleInfo.xScaleName && scaleInfo.xFieldName || scaleInfo.yScaleName && scaleInfo.yFieldName));

  // const groupRecord: GroupRecord = state.getIn(['vis', 'present', 'marks', String(ownProps.groupId)]);

  const marksOfGroups: Map<number, MarkRecord[]> = groups.map(group => {
    return group.marks.map(markId => {
      return state.getIn(['vis', 'present', 'marks', String(markId)]);
    }).filter((mark) => {
      return !(mark.type === 'group' || mark.name.indexOf('lyra') === 0);
    });
  });

  const datasets: Map<string, DatasetRecord> = state.getIn(['vis', 'present', 'datasets']);

  const fieldsOfGroups: Map<number, string[]> = marksOfGroups.map((marksOfGroup) => {
    if (marksOfGroup.length && marksOfGroup[0].from && marksOfGroup[0].from.data) {
      const dsId = String(marksOfGroup[0].from.data);
      const dataset: DatasetRecord =  datasets.get(dsId);
      const schema = dataset.get('_schema');
      const fields = schema.keySeq().toArray();
      return fields;
    }
    return [];
  });


  // const encState: EncodingStateRecord = state.getIn(['inspector', 'encodings']);
  // const selId   = encState.get('selectedId');
  // const selType = encState.get('selectedType');
  // const isSelectedInteraction = selType === getType(selectInteraction);

  // let interactionRecordId = null;
  // if (isSelectedInteraction) {
  //   const maybeIdInGroup = groupRecord.get('_interactions').filter(id => {
  //     const record: InteractionRecord = state.getIn(['vis', 'present', 'interactions', String(id)]);
  //     // if (record.selectionDef && record.selectionDef.label === 'Widget') return false;
  //     return id === selId;
  //   });
  //   if (maybeIdInGroup.length) {
  //     interactionRecordId = maybeIdInGroup[0];
  //   }
  // }
  // if (!interactionRecordId) {
  //   const maybeUnfinishedSpecification = groupRecord.get('_interactions').filter(id => {
  //     const record: InteractionRecord = state.getIn(['vis', 'present', 'interactions', String(id)]);
  //     return !Boolean(record.selectionDef && record.applicationDef);
  //   });
  //   if (maybeUnfinishedSpecification.length) {
  //     interactionRecordId = maybeUnfinishedSpecification[0];
  //   }
  // }
  // const interactionRecord = interactionRecordId ? state.getIn(['vis', 'present', 'interactions', String(interactionRecordId)]) : null;

  return {
    groups,
    scaleInfoForGroups,
    marksOfGroups,
    fieldsOfGroups,
    canDemonstrateGroups,
    datasets
    // canDemonstrate,
    // groupRecord,
    // marksOfGroup,
    // groupName: exportName(groupRecord.name),
    // interactionRecord,
    // scaleInfo
  };
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    addInteraction: (groupId) => {
      const record = Interaction({
        groupId
      });
      const addAction = addInteraction(record);
      dispatch(addAction);
      dispatch(addInteractionToGroup(addAction.meta, groupId));
      return addAction.meta;
    },
    setSelection: (def: any, id: number) => {
      dispatch(setSelection(def, id));
    },
    setApplication: (def: any, id: number) => {
      console.log(def, id);
      dispatch(setApplication(def, id));
    },
    selectInteraction: (id: number) => {
      dispatch(selectInteraction(id));
    }
  };
}

class InteractionPreviewController extends React.Component<StateProps & DispatchProps, OwnState> {

  constructor(props) {
    super(props);

    this.state = {
      isDemonstratingInterval: false,
      groupId: null,
      groupName: null,
      selectionPreviews: [],
      applicationPreviews: []
    };
  }

  public componentDidUpdate(prevProps: StateProps, prevState: OwnState) {
    // if (prevProps.vegaIsParsing && !this.props.vegaIsParsing) {
    //   const spec = cleanSpecForPreview(ctrl.export(false, true), this.props.groupName);
    //   // spec = resizeSpec(spec, 100, 100);
    //   this.setState({
    //     spec
    //   });
    // }

    this.props.groups.forEach((group) => {
      const groupId = group._id;
      const groupName = exportName(group.name);
      if (!prevProps.canDemonstrateGroups.get(groupId) && this.props.canDemonstrateGroups.get(groupId)) {
        this.onSignal(groupId, groupName, 'grid_translate_anchor', (name, value) => this.onMainViewGridSignal(name, value));
        this.onSignal(groupId, groupName, 'grid_translate_delta', (name, value) => this.onMainViewGridSignal(name, value));
        this.onSignal(groupId, groupName, 'brush_x', (name, value) => this.onMainViewIntervalSignal(name, value));
        this.onSignal(groupId, groupName, 'brush_y', (name, value) => this.onMainViewIntervalSignal(name, value));
        this.onSignal(groupId, groupName, 'points_tuple', (name, value) => this.onMainViewPointSignal(name, value));
        this.onSignal(groupId, groupName, 'points_toggle', (name, value) => this.onMainViewPointSignal(name, value));

        this.restoreSignalValues(groupName);
      }
    });

    if (prevState.groupId !== this.state.groupId || prevState.isDemonstratingInterval !== this.state.isDemonstratingInterval) {
      this.generatePreviews();
    }

    // if (prevState.isDemonstratingInterval !== this.state.isDemonstratingInterval ||
    //     prevState.isDemonstratingPoint !== this.state.isDemonstratingPoint) {
    //   if (this.state.isDemonstratingInterval || this.state.isDemonstratingPoint) {
    //     if (!this.props.interactionRecord) {
    //       this.props.addInteraction(this.props.groupId);
    //     }
    //     else {
    //       this.props.selectInteraction(this.props.interactionRecord.id);
    //     }
    //   }
    //   this.setState({
    //     selectionPreviews: this.getSelectionPreviewDefs(),
    //     applicationPreviews: this.getApplicationPreviewDefs()
    //   });
    // }
  }

  private mainViewSignalValues = {};

  private generatePreviews = debounce(250, () => {
      const groupId = this.state.groupId;
      const marksOfGroup = this.props.marksOfGroups.get(groupId);
      const scaleInfo = this.props.scaleInfoForGroups.get(groupId);
      const fieldsOfGroup = this.props.fieldsOfGroups.get(groupId);

      const selectionPreviews = this.generateSelectionPreviews(marksOfGroup, scaleInfo, fieldsOfGroup);
      const applicationPreviews = this.generateApplicationPreviews(groupId, marksOfGroup, scaleInfo);

      console.log('regenerated previews');

      this.setState({
        selectionPreviews,
        applicationPreviews
      });
    });

  private generateSelectionPreviews(marksOfGroup: MarkRecord[], scaleInfo: ScaleInfo, fieldsOfGroup: string[]): SelectionRecord[] {
    if (this.state.isDemonstratingInterval) {
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
        const areaMark = marksOfGroup.filter(mark => mark.type === 'area')[0].toJS();
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
        })
      ];
      // TODO(jzong): add heuristic here by sorting the fields by frequency
      fieldsOfGroup.forEach(field => {
        defs.push(PointSelection({
          ptype: 'single',
          id: `single_${field}`,
          label: `Single point (${field})`,
          field
        }));
        defs.push(PointSelection({
          ptype: 'multi',
          id: `multi_${field}`,
          label: `Multi point (${field})`,
          field
        }));
      });
      return defs;
    }
  }

  private generateApplicationPreviews(groupId: number, marksOfGroup: MarkRecord[], scaleInfo: ScaleInfo): ApplicationRecord[] {
    const defs: ApplicationRecord[] = [];

    // TODO(jzong): could add a heuristic -- better way to sort these?
    marksOfGroup.forEach(mark => {
      defs.push(MarkApplication({
        id: "color",
        label: "Color",
        targetMarkName: exportName(mark.name),
        isDemonstratingInterval: this.state.isDemonstratingInterval,
        propertyName: "fill",
        defaultValue: "grey"
      }));
      defs.push(MarkApplication({
        id: "opacity",
        label: "Opacity",
        targetMarkName: exportName(mark.name),
        isDemonstratingInterval: this.state.isDemonstratingInterval,
        propertyName: "opacity",
        defaultValue: "0.2"
      }));
      if (mark.type === 'symbol') {
        defs.push(MarkApplication({
          id: "size",
          label: "Size",
          targetMarkName: exportName(mark.name),
          isDemonstratingInterval: this.state.isDemonstratingInterval,
          propertyName: "size",
          defaultValue: 30
        }));
      }
    });

    if (this.state.isDemonstratingInterval) {
      defs.push(ScaleApplication({
        id: "panzoom",
        label: "Pan and zoom",
        scaleInfo
      }));
    }

    const otherGroups = this.props.groups.filter(group => group._id !== groupId);
    otherGroups.forEach(otherGroup => {
      const otherGroupId = otherGroup._id;
      const marksOfOtherGroup = this.props.marksOfGroups.get(otherGroupId);
      const maybeMarkWithDataset = marksOfOtherGroup.filter(mark => mark.from && mark.from.data);
      if (maybeMarkWithDataset.length) {
        const mark = maybeMarkWithDataset[0];
        const targetGroupName = exportName(otherGroup.name);
        const targetMarkName = exportName(mark.name);

        const datasetName = this.props.datasets.get(String(mark.from.data)).name;

        defs.push(TransformApplication({
          id: "filter_" + targetGroupName,
          label: "Filter " + otherGroup.name,
          targetGroupName,
          datasetName,
          targetMarkName,
          isDemonstratingInterval: this.state.isDemonstratingInterval
        }));
      }
    });

    return defs;
  }

  private updateIsDemonstratingInterval() {
    const isDemonstratingInterval = (this.mainViewSignalValues['brush_x'] &&
      this.mainViewSignalValues['brush_y'] &&
      this.mainViewSignalValues['brush_x'][0] !== this.mainViewSignalValues['brush_x'][1] &&
      this.mainViewSignalValues['brush_y'][0] !== this.mainViewSignalValues['brush_y'][1]) || !this.mainViewSignalValues['points_tuple'];

    if (isDemonstratingInterval !== this.state.isDemonstratingInterval) {
        this.setState({
          isDemonstratingInterval
        });
    }
  }

  private updatePreviewSignals(name, value) {
    this.state.selectionPreviews.forEach(preview => {
      if (this.previewRefs[preview.id] && this.previewRefs[preview.id].current) {
        this.previewRefs[preview.id].current.setPreviewSignal(name, value);
      }
    });
    this.state.applicationPreviews.forEach(preview => {
      if (this.previewRefs[preview.id] && this.previewRefs[preview.id].current) {
        this.previewRefs[preview.id].current.setPreviewSignal(name, value);
      }
    });
  }

  private onMainViewPointSignal(name, value) {
    this.mainViewSignalValues[name] = value;

    this.updateIsDemonstratingInterval();

    this.updatePreviewSignals(name, value);
  }

  private onMainViewIntervalSignal(name, value) {
    this.mainViewSignalValues[name] = value;

    this.updateIsDemonstratingInterval();

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

    this.updatePreviewSignals(name, scaledValue);
  }

  private onMainViewGridSignal(name, value) {
    this.mainViewSignalValues[name] = value;

    const wScale = 100/640;
    const hScale = 100/360; // TODO(jzong) preview height / main view height
    const scaledValue = this.mainViewSignalValues['grid_translate_delta'] ? {
      x: this.mainViewSignalValues['grid_translate_delta'].x * wScale,
      y: this.mainViewSignalValues['grid_translate_delta'].y * hScale
    } : null;

    // update grid signals in previews
    this.state.applicationPreviews.forEach(preview => {
      if (this.previewRefs[preview.id] && this.previewRefs[preview.id].current) {
        if (this.mainViewSignalValues['grid_translate_anchor']) {
          this.previewRefs[preview.id].current.setPreviewSignal('grid_translate_anchor', this.mainViewSignalValues['grid_translate_anchor']);
        }
        if (this.mainViewSignalValues['grid_translate_delta']) {
          this.previewRefs[preview.id].current.setPreviewSignal('grid_translate_delta', scaledValue);
        }
      }
    });
  }

  private restoreSignalValues(groupName) {
    for (let signalName of ['brush_x', 'brush_y', 'points_tuple', 'points_toggle']) {
      if (this.mainViewSignalValues[signalName]) {
        listeners.setSignalInGroup(ctrl.view, groupName, signalName, this.mainViewSignalValues[signalName]);
      }
    }
  }

  private onSignal(groupId, groupName, signalName, handler) {
    listeners.onSignalInGroup(ctrl.view, groupName, signalName, (name, value) => {
      console.log(groupId);
      if (this.state.groupId !== groupId) {
        this.setState({
          groupId,
          groupName: exportName(this.props.groups.get(groupId).name)
        });
      }
      handler(name, value);
    });
  }

  private previewRefs = {}; // id -> ref

  private onClickInteractionPreview(preview) {
  }

  public render() {

    // return <div></div>;
    return (
      <div className={"preview-controller" + (this.state.selectionPreviews.length  ? " active" : "")}>
        {this.state.selectionPreviews.length ? <h2>Interactions</h2> : null}
        {this.state.selectionPreviews.length ? <h5>Selections</h5> : null}
        <div className="preview-scroll">
          {
            this.state.selectionPreviews.map((preview) => {
              if (!this.previewRefs[preview.id]) {
                this.previewRefs[preview.id] = React.createRef();
              }
              return (
                // <div key={preview.id} className={this.props.interactionRecord && this.props.interactionRecord.selectionDef && this.props.interactionRecord.selectionDef.id === preview.id ? 'selected' : ''}>
                <div key={preview.id}>
                  <div className="preview-label">{preview.label}</div>
                  <InteractionPreview ref={this.previewRefs[preview.id]}
                    id={`preview-${preview.id}`}
                    groupName={this.state.groupName}
                    preview={preview}
                    onClick={() => this.onClickInteractionPreview(preview)}/>
                </div>
              )
            })
          }
        </div>
        {this.state.applicationPreviews.length ? <h5>Applications</h5> : null}
        <div className="preview-scroll">
          {
            this.state.applicationPreviews.map((preview) => {
              if (!this.previewRefs[preview.id]) {
                this.previewRefs[preview.id] = React.createRef();
              }
              return (
                // <div key={preview.id} className={this.props.interactionRecord && this.props.interactionRecord.selectionDef && this.props.interactionRecord.selectionDef.id === preview.id ? 'selected' : ''}>
                <div key={preview.id}>
                  <div className="preview-label">{preview.label}</div>
                  <InteractionPreview ref={this.previewRefs[preview.id]}
                    id={`preview-${preview.id}`}
                    groupName={this.state.groupName}
                    preview={preview}
                    onClick={() => this.onClickInteractionPreview(preview)}/>
                </div>
              )
            })
          }
        </div>
      </div>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(InteractionPreviewController);
