import * as React from 'react';
import {Map} from 'immutable';
import { connect } from 'react-redux';
import {State} from '../../store';
import {Signal, Spec} from 'vega';
import {getScaleInfoForGroup, cleanSpecForPreview, editSignalsForPreview, selectionPreviewDefs, applicationPreviewDefs, editMarksForPreview, editScalesForPreview, ScaleSimpleType} from '../../ctrl/demonstrations';
import InteractionPreview from './InteractionPreview';
import {InteractionRecord, Interaction, LyraSelection, LyraApplication, LyraPointSelection, LyraIntervalSelection, ScaleInfo} from '../../store/factory/Interaction';
import {Dispatch} from 'redux';
import {addInteraction, setSelection, setApplication} from '../../actions/interactionActions';
import {GroupRecord} from '../../store/factory/marks/Group';
import exportName from '../../util/exportName';
import {addInteractionToGroup} from '../../actions/bindChannel/helperActions';
import {LyraMarkType, MarkRecord} from '../../store/factory/Mark';
import {EncodingStateRecord} from '../../store/factory/Inspector';
import {selectInteraction} from '../../actions/inspectorActions';
import {getType} from 'typesafe-actions';
import {updateVal} from '../inspectors/Interaction';
import {DatasetRecord} from '../../store/factory/Dataset';

const ctrl = require('../../ctrl');
const listeners = require('../../ctrl/listeners');

interface StateProps {
  groups: Map<number, GroupRecord>;
  scaleInfoForGroups: Map<number, ScaleInfo>; // map of group ids to scale info
  marksOfGroups: Map<number, MarkRecord[]>; // map of group ids to array of mark specs
  fieldsOfGroups: Map<number, string[]>; // map of group ids to array of fields
  canDemonstrateGroups: Map<number, Boolean>;
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

  const fieldsOfGroups: Map<number, string[]> = marksOfGroups.map((marksOfGroup) => {
    if (marksOfGroup.length && marksOfGroup[0].from && marksOfGroup[0].from.data) {
      const dsId = marksOfGroup[0].from.data;
      const dataset: DatasetRecord =  state.getIn(['vis', 'present', 'datasets', dsId]);
      if (dataset) {
        const schema = dataset.get('_schema');
        const fields = schema.keySeq().toArray();
        return fields;
      }
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
    // canDemonstrate,
    // groupRecord,
    // marksOfGroup,
    // groupName: exportName(groupRecord.name),
    // interactionRecord,
    // scaleInfo
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps): DispatchProps {
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
      const {selectionPreviews, applicationPreviews} = this.generatePreviewDefs(this.state.groupId);
      console.log(selectionPreviews, applicationPreviews);
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

  private generatePreviewDefs(groupId: number): {selectionPreviews: LyraSelection[], applicationPreviews: LyraApplication[]} {
    const marksOfGroup = this.props.marksOfGroups.get(groupId);
    const scaleInfo = this.props.scaleInfoForGroups.get(groupId);
    const fieldsOfGroup = this.props.fieldsOfGroups.get(groupId);

    const selectionPreviews = this.generateSelectionPreviews(marksOfGroup, scaleInfo, fieldsOfGroup);
    const applicationPreviews = this.generateApplicationPreviews(groupId, marksOfGroup, scaleInfo);

    return {
      selectionPreviews,
      applicationPreviews
    }
  }

  private generateSelectionPreviews(marksOfGroup: MarkRecord[], scaleInfo: ScaleInfo, fieldsOfGroup: string[]): LyraSelection[] {
    if (this.state.isDemonstratingInterval) {
      const defs: LyraIntervalSelection[] = [];
      const brush = {
        id: "brush",
        label: "Brush",
        field: 'xy' as const
      };
      const brush_y = {
        id: "brush_y",
        label: "Brush (y-axis)",
        field: 'y' as const
      };
      const brush_x = {
        id: "brush_x",
        label: "Brush (x-axis)",
        field: 'x' as const
      };

      // HEURISTICS: surface different interval selections depending on mark type
      const markTypes: Set<LyraMarkType> = new Set(marksOfGroup.map((mark) => mark.type));
      console.log(markTypes);
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
      const defs: LyraPointSelection[] = [
        {
          id: 'single',
          label: 'Single point',
          field: '_vgsid_'
        },
        {
          id: 'multi',
          label: 'Multi point',
          field: '_vgsid_'
        }
      ];
      // TODO(jzong): add heuristic here by sorting the fields by frequency
      fieldsOfGroup.forEach(field => {
        defs.push({
          id: `single_${field}`,
          label: `Single point (match on ${field})`,
          field
        });
        defs.push({
          id: `multi_${field}`,
          label: `Multi point (match on ${field})`,
          field
        });
      });
      return defs;
    }
  }

  private generateApplicationPreviews(groupId: number, marksOfGroup: MarkRecord[], scaleInfo: ScaleInfo): LyraApplication[] {
    const defs: LyraApplication[] = [];

    // TODO(jzong): could add a heuristic -- better way to sort these?
    marksOfGroup.forEach(mark => {
      defs.push({
        id: "color",
        label: "Color",
        targetMarkName: exportName(mark.name),
        isDemonstratingInterval: this.state.isDemonstratingInterval
      });
      defs.push({
        id: "opacity",
        label: "Opacity",
        targetMarkName: exportName(mark.name),
        isDemonstratingInterval: this.state.isDemonstratingInterval
      });
      if (mark.type === 'symbol') {
        defs.push({
          id: "size",
          label: "Size",
          targetMarkName: exportName(mark.name),
          isDemonstratingInterval: this.state.isDemonstratingInterval
        });
      }
    });

    if (this.state.isDemonstratingInterval) {
      defs.push({
        id: "panzoom",
        label: "Pan and zoom",
        scaleInfo
      });
    }

    const otherGroups = this.props.groups.filter(group => group._id !== groupId);
    otherGroups.forEach(otherGroup => {
      const otherGroupId = otherGroup._id;
      const marksOfOtherGroup = this.props.marksOfGroups.get(otherGroupId);
      const maybeDataset = marksOfOtherGroup.filter(mark => mark.from && mark.from.data).map(mark => mark.from.data);
      if (maybeDataset.length) {
        const targetGroupName = exportName(otherGroup.name);
        const newDatasetName = maybeDataset[0] + "_filter_" + targetGroupName;

        defs.push({
          id: "filter_" + targetGroupName,
          label: "Filter " + otherGroup.name,
          targetGroupName,
          newDatasetName,
          isDemonstratingInterval: this.state.isDemonstratingInterval
        });
      }
    });

    return defs;
  }

  private onMainViewAnySignal(name, value) {
    // console.log(name, value);
    this.mainViewSignalValues[name] = value;
  }

  private onMainViewPointSignal(name, value) {
    this.onMainViewAnySignal(name, value);

    const isDemonstratingInterval = !this.mainViewSignalValues['points_tuple'];
    if (isDemonstratingInterval && !this.state.isDemonstratingInterval) {
      clearTimeout(this.cancelDemonstrationTimeout);
      this.cancelDemonstrationTimeout = setTimeout(() => {
        this.setState({
          isDemonstratingInterval
        });
      }, 250);
    }
    else {
      if (!isDemonstratingInterval) {
        clearTimeout(this.cancelDemonstrationTimeout);
        this.cancelDemonstrationTimeout = null;
      }
      this.setState({
        isDemonstratingInterval
      });
    }

    // this.state.selectionPreviews.forEach(preview => {
    //   if (preview.ref.current) {
    //     preview.ref.current.setPreviewSignal(name, value);
    //   }
    // });
    // this.state.applicationPreviews.forEach(preview => {
    //   if (preview.ref.current) {
    //     preview.ref.current.setPreviewSignal(name, value);
    //   }
    // });
  }

  private cancelDemonstrationTimeout = null;

  private onMainViewIntervalSignal(name, value) {
    this.onMainViewAnySignal(name, value);

    const isDemonstratingInterval = this.mainViewSignalValues['brush_x'] &&
      this.mainViewSignalValues['brush_y'] &&
      this.mainViewSignalValues['brush_x'][0] !== this.mainViewSignalValues['brush_x'][1] &&
      this.mainViewSignalValues['brush_y'][0] !== this.mainViewSignalValues['brush_y'][1];
    if (!isDemonstratingInterval && this.state.isDemonstratingInterval) {
      clearTimeout(this.cancelDemonstrationTimeout);
      this.cancelDemonstrationTimeout = setTimeout(() => {
        this.setState({
          isDemonstratingInterval
        });
      }, 250);
    }
    else {
      if (isDemonstratingInterval) {
        clearTimeout(this.cancelDemonstrationTimeout);
        this.cancelDemonstrationTimeout = null;
      }
      this.setState({
        isDemonstratingInterval
      });
    }

    // const wScale = 100/640;
    // const hScale = 100/360; // TODO(jzong) preview height / main view height

    // const scaledValue = value.map(n => {
    //   if (name === 'brush_x') {
    //     return n * wScale;
    //   }
    //   else if (name === 'brush_y') {
    //     return n * hScale;
    //   }
    // });

    // this.state.selectionPreviews.forEach(preview => {
    //   if (preview.ref.current) {
    //     preview.ref.current.setPreviewSignal(name, scaledValue);
    //   }
    // });
    // this.state.applicationPreviews.forEach(preview => {
    //   if (preview.ref.current) {
    //     preview.ref.current.setPreviewSignal(name, scaledValue);
    //   }
    // });
  }

  private onMainViewGridSignal(name, value) {
    this.onMainViewAnySignal(name, value);

    // const wScale = 100/640;
    // const hScale = 100/360; // TODO(jzong) preview height / main view height
    // const scaledValue = this.mainViewSignalValues['grid_translate_delta'] ? {
    //   x: this.mainViewSignalValues['grid_translate_delta'].x * wScale,
    //   y: this.mainViewSignalValues['grid_translate_delta'].y * hScale
    // } : null;
    // this.state.applicationPreviews.forEach(preview => {
    //   if (preview.ref.current) {
    //     if (this.mainViewSignalValues['grid_translate_anchor']) {
    //       preview.ref.current.setPreviewSignal('grid_translate_anchor', this.mainViewSignalValues['grid_translate_anchor']);
    //     }
    //     if (this.mainViewSignalValues['grid_translate_delta']) {
    //       preview.ref.current.setPreviewSignal('grid_translate_delta', scaledValue);
    //     }
    //   }
    // });
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
      if (this.state.groupId !== groupId) {
        this.setState({
          groupId,
          groupName: exportName(this.props.groups.get(groupId).name)
        });
      }
      handler(name, value);
    });
  }

  private onClickInteractionPreview(preview) {
    if (this.props.interactionRecord.selectionDef && this.props.interactionRecord.selectionDef.id === preview.id) {
      this.props.setSelection(null, this.props.interactionRecord.id);
    }
    else {
      const fieldPresent = this.props.interactionRecord.selectionDef && this.props.interactionRecord.selectionDef.field ? true: false;
      if(fieldPresent && this.state.isDemonstratingPoint) {
        const field = this.props.interactionRecord.selectionDef.field;
        const currentDef = Object.assign({},preview);
        if(currentDef && currentDef.signals.length) {
          currentDef.signals[0].on[0]['update'] = updateVal(field);
          currentDef.signals[1]['value'][0].field = field;
          currentDef.field = field;
          this.props.setSelection(currentDef, this.props.interactionRecord.id);
        } else this.props.setSelection(preview, this.props.interactionRecord.id);
      }
      else this.props.setSelection(preview, this.props.interactionRecord.id);
    }
    this.setState({
      applicationPreviews: this.getApplicationPreviewDefs()
    });
  }

  private onClickApplicationPreview(preview) {
    if (this.props.interactionRecord.applicationDef && this.props.interactionRecord.applicationDef.id === preview.id) {
      this.props.setApplication(null, this.props.interactionRecord.id);
    }
    else {
      if (!this.props.interactionRecord.selectionDef) {
        this.props.setSelection(this.state.selectionPreviews[0], this.props.interactionRecord.id);
      }
      this.props.setApplication(preview, this.props.interactionRecord.id);
    }
  }

  public render() {

    return <div></div>;
    // return (
    //   <div className={"preview-controller" + (this.state.selectionPreviews.length  ? " active" : "")}>
    //     {this.state.selectionPreviews.length ? <h2>Interactions</h2> : null}
    //     {this.state.selectionPreviews.length ? <h5>Selections</h5> : null}
    //     <div className="preview-scroll">
    //       {
    //         this.state.selectionPreviews.map((preview) => {
    //           preview.ref = React.createRef();
    //           const spec = editSignalsForPreview(this.state.spec, this.props.groupName, preview.signals);
    //           return (
    //             <div key={preview.id} className={this.props.interactionRecord && this.props.interactionRecord.selectionDef && this.props.interactionRecord.selectionDef.id === preview.id ? 'selected' : ''}>
    //               <div className="preview-label">{preview.label}</div>
    //               <InteractionPreview ref={preview.ref}
    //                 id={`preview-${preview.id}`}
    //                 groupName={this.props.groupName}
    //                 spec={spec}
    //                 onClick={() => this.onClickInteractionPreview(preview)}/>
    //             </div>
    //           )
    //         })
    //       }
    //     </div>
    //     {this.state.applicationPreviews.length ? <h5>Applications</h5> : null}
    //     <div className="preview-scroll">
    //       {
    //         this.state.applicationPreviews.map((preview) => {
    //           preview.ref = React.createRef();
    //           const selectedInteractionSignals = [].concat.apply([], this.state.selectionPreviews.filter((def) => {
    //             return this.props.interactionRecord && this.props.interactionRecord.selectionDef && this.props.interactionRecord.selectionDef.id === def.id;
    //           }).map((def) => def.signals));
    //           let spec = cleanSpecForPreview(ctrl.export(false, true), preview.groupName);
    //           spec = editSignalsForPreview(spec, this.props.groupName, selectedInteractionSignals);
    //           spec = editSignalsForPreview(spec, preview.groupName, []);
    //           spec = editMarksForPreview(spec, this.props.groupName, preview);
    //           if (preview.id === 'panzoom') {
    //             spec = editScalesForPreview(spec, this.props.groupName, preview);
    //           }
    //           return (
    //             <div key={preview.id} className={this.props.interactionRecord && this.props.interactionRecord.applicationDef && this.props.interactionRecord.applicationDef.id === preview.id ? 'selected' : ''}>
    //               <div className="preview-label">{preview.label}</div>
    //               <InteractionPreview ref={preview.ref}
    //                 id={`preview-${preview.id}`}
    //                 groupName={this.props.groupName}
    //                 spec={spec}
    //                 onClick={() => this.onClickApplicationPreview(preview)}/>
    //             </div>
    //           )
    //         })
    //       }
    //     </div>
    //   </div>
    // );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(InteractionPreviewController);
