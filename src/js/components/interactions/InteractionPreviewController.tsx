import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../../store';
import {Signal, Spec} from 'vega';
import {getScaleInfoForGroup, cleanSpecForPreview, editSignalsForPreview, selectionPreviewDefs, mappingPreviewDefs, editMarksForPreview, editScalesForPreview, ScaleSimpleType} from '../../ctrl/demonstrations';
import InteractionPreview from './InteractionPreview';
import {InteractionRecord, Interaction} from '../../store/factory/Interaction';
import {Dispatch} from 'redux';
import {addInteraction, setSelection, setMapping} from '../../actions/interactionActions';
import {GroupRecord} from '../../store/factory/marks/Group';
import exportName from '../../util/exportName';
import {addInteractionToGroup} from '../../actions/bindChannel/helperActions';
import {LyraMarkType, MarkRecord} from '../../store/factory/Mark';
import {EncodingStateRecord} from '../../store/factory/Inspector';
import {selectInteraction} from '../../actions/inspectorActions';
import {getType} from 'typesafe-actions';
import {updateVal} from '../inspectors/Interaction';

const ctrl = require('../../ctrl');
const listeners = require('../../ctrl/listeners');

interface OwnProps {
  groupId: number;
}
interface StateProps {
  vegaIsParsing: boolean;
  canDemonstrate: boolean;
  groupRecord: GroupRecord;
  marksOfGroup: any[];
  groupName: string;
  interactionRecord: InteractionRecord;
  scaleInfo: ScaleInfo;

}

export interface ScaleInfo {
  xScaleName: string;
  yScaleName: string;
  xFieldName: string;
  yFieldName: string;
  xScaleType: ScaleSimpleType;
  yScaleType: ScaleSimpleType;

}

interface DispatchProps {
  addInteraction: (groupId: number) => number; // return id of newly created interaction
  setSelection: (def: any, id: number) => void;
  setMapping: (def: any, id: number) => void;
  selectInteraction: (id: number) => void;
}

export interface LyraSelectionPreviewDef {
  id: string,
  label: string,
  ref?: React.RefObject<InteractionPreview>,
  signals: Signal[],
  field: string,
}

export interface LyraMappingPreviewDef {
  id: string,
  label: string,
  ref?: React.RefObject<InteractionPreview>,
  groupName: string, // which group to apply this mapping in (not necessarily the same as the interaction's parent group, for multiview)
  markType?: Exclude<LyraMarkType, 'group'>,
  markProperties: any // partial mark object,

  scaleProperties?: any[] // list of partial scale objects
  datasetProperties?: any // partial dataset object
  comparator?: string // comparison operator for widgets
}

interface OwnState {
  isDemonstratingInterval: boolean,
  isDemonstratingPoint: boolean,
  spec: Spec,
  selectionPreviews: LyraSelectionPreviewDef[],
  mappingPreviews: LyraMappingPreviewDef[]
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  const scaleInfo = getScaleInfoForGroup(state, ownProps.groupId);

  const isParsing = state.getIn(['vega', 'isParsing']);

  const canDemonstrate = Boolean(!isParsing && ctrl.view && (scaleInfo.xScaleName && scaleInfo.xFieldName || scaleInfo.yScaleName && scaleInfo.yFieldName));

  const groupRecord: GroupRecord = state.getIn(['vis', 'present', 'marks', String(ownProps.groupId)]);

  const marksOfGroup = groupRecord.marks.map((markId) => {
    return state.getIn(['vis', 'present', 'marks', String(markId)]).toJS();
  }).filter((mark) => {
    return !(mark.type === 'group' || mark.name.indexOf('lyra') === 0);
  });

  const encState: EncodingStateRecord = state.getIn(['inspector', 'encodings']);
  const selId   = encState.get('selectedId');
  const selType = encState.get('selectedType');
  const isSelectedInteraction = selType === getType(selectInteraction);

  let interactionRecordId = null;
  if (isSelectedInteraction) {
    const maybeIdInGroup = groupRecord.get('_interactions').filter(id => id === selId);
    if (maybeIdInGroup.length) {
      interactionRecordId = maybeIdInGroup[0];
    }
  }
  if (!interactionRecordId) {
    const maybeUnfinishedSpecification = groupRecord.get('_interactions').filter(id => {
      const record: InteractionRecord = state.getIn(['vis', 'present', 'interactions', String(id)]);
      return !Boolean(record.selectionDef && record.mappingDef);
    });
    if (maybeUnfinishedSpecification.length) {
      interactionRecordId = maybeUnfinishedSpecification[0];
    }
  }
  const interactionRecord = interactionRecordId ? state.getIn(['vis', 'present', 'interactions', String(interactionRecordId)]) : null;

  return {
    vegaIsParsing: isParsing,
    canDemonstrate,
    groupRecord,
    marksOfGroup,
    groupName: exportName(groupRecord.name),
    interactionRecord,
    scaleInfo
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps): DispatchProps {
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
    setMapping: (def: any, id: number) => {
      dispatch(setMapping(def, id));
    },
    selectInteraction: (id: number) => {
      dispatch(selectInteraction(id));
    }
  };
}

class InteractionPreviewController extends React.Component<OwnProps & StateProps & DispatchProps, OwnState> {

  constructor(props) {
    super(props);

    this.state = {
      isDemonstratingInterval: false,
      isDemonstratingPoint: false,
      spec: null,
      selectionPreviews: [],
      mappingPreviews: []
    };
  }

  public componentDidMount() {
    // for debugging
    (window as any)["dumpSignals"+this.props.groupName] = () => {
      for (let signalName of ['brush', 'lyra_brush_x', 'lyra_brush_y', 'brush_x', 'brush_y', 'points_tuple', 'points_toggle', 'grid', 'grid_translate_anchor', 'grid_translate_delta']) {
        console.log(signalName, listeners.getSignalInGroup(ctrl.view, this.props.groupName, signalName))
      }
    }
  }

  public componentDidUpdate(prevProps: OwnProps & StateProps, prevState: OwnState) {
    if (prevProps.vegaIsParsing && !this.props.vegaIsParsing) {
      const spec = cleanSpecForPreview(ctrl.export(false, true), this.props.groupName);
      // spec = resizeSpec(spec, 100, 100);
      this.setState({
        spec
      });
    }

    if (!prevProps.canDemonstrate && this.props.canDemonstrate) {

      this.onSignal('grid_translate_anchor', (name, value) => this.onMainViewGridSignal(name, value));
      this.onSignal('grid_translate_delta', (name, value) => this.onMainViewGridSignal(name, value));
      this.onSignal('brush_x', (name, value) => this.onMainViewIntervalSignal(name, value));
      this.onSignal('brush_y', (name, value) => this.onMainViewIntervalSignal(name, value));
      this.onSignal('points_tuple', (name, value) => this.onMainViewPointSignal(name, value));
      this.onSignal('points_toggle', (name, value) => this.onMainViewPointSignal(name, value));

      this.restoreSignalValues();
    }

    if (prevState.isDemonstratingInterval !== this.state.isDemonstratingInterval ||
        prevState.isDemonstratingPoint !== this.state.isDemonstratingPoint) {
      if (this.state.isDemonstratingInterval || this.state.isDemonstratingPoint) {
        if (!this.props.interactionRecord) {
          this.props.addInteraction(this.props.groupId);
        }
        else {
          this.props.selectInteraction(this.props.interactionRecord.id);
        }
      }
      this.setState({
        selectionPreviews: this.getSelectionPreviewDefs(),
        mappingPreviews: this.getMappingPreviewDefs()
      });
    }
  }

  private mainViewSignalValues = {};

  private getSelectionPreviewDefs(): LyraSelectionPreviewDef[] {
    if (this.state.isDemonstratingInterval) {
      return selectionPreviewDefs(this.state.isDemonstratingInterval, false, this.props.marksOfGroup, this.props.scaleInfo);
    }
    if (this.state.isDemonstratingPoint) {
      return selectionPreviewDefs(false, this.state.isDemonstratingPoint, this.props.marksOfGroup, this.props.scaleInfo);
    }
    return [];
  }

  private getMappingPreviewDefs(): LyraMappingPreviewDef[] {
    if (this.state.isDemonstratingInterval || this.state.isDemonstratingPoint) {
      return mappingPreviewDefs(this.state.isDemonstratingInterval, this.props.marksOfGroup, this.props.scaleInfo, this.props.groupName, ctrl.export());
    }
    return [];
  }

  private onMainViewPointSignal(name, value) {
    console.log(name, value)
    this.mainViewSignalValues[name] = value;
    const isDemonstratingPoint = this.mainViewSignalValues['points_tuple'];
      if (!isDemonstratingPoint && this.state.isDemonstratingPoint) {
        clearTimeout(this.cancelDemonstrationTimeout);
        this.cancelDemonstrationTimeout = setTimeout(() => {
          this.setState({
            isDemonstratingPoint
          });
        }, 250);
      }
      else {
        if (isDemonstratingPoint) {
          clearTimeout(this.cancelDemonstrationTimeout);
          this.cancelDemonstrationTimeout = null;
        }
        this.setState({
          isDemonstratingPoint
        });
      }

    this.state.selectionPreviews.forEach(preview => {
      if (preview.ref.current) {
        preview.ref.current.setPreviewSignal(name, value);
      }
    });
    this.state.mappingPreviews.forEach(preview => {
      if (preview.ref.current) {
        preview.ref.current.setPreviewSignal(name, value);
      }
    });
  }

  private cancelDemonstrationTimeout = null;

  private onMainViewIntervalSignal(name, value) {
    this.mainViewSignalValues[name] = value;
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

    this.state.selectionPreviews.forEach(preview => {
      if (preview.ref.current) {
        preview.ref.current.setPreviewSignal(name, scaledValue);
      }
    });
    this.state.mappingPreviews.forEach(preview => {
      if (preview.ref.current) {
        preview.ref.current.setPreviewSignal(name, scaledValue);
      }
    });
  }

  private onMainViewGridSignal(name, value) {
    this.mainViewSignalValues[name] = value;

    const wScale = 100/640;
    const hScale = 100/360; // TODO(jzong) preview height / main view height
    const scaledValue = this.mainViewSignalValues['grid_translate_delta'] ? {
      x: this.mainViewSignalValues['grid_translate_delta'].x * wScale,
      y: this.mainViewSignalValues['grid_translate_delta'].y * hScale
    } : null;
    this.state.mappingPreviews.forEach(preview => {
      if (preview.ref.current) {
        if (this.mainViewSignalValues['grid_translate_anchor']) {
          preview.ref.current.setPreviewSignal('grid_translate_anchor', this.mainViewSignalValues['grid_translate_anchor']);
        }
        if (this.mainViewSignalValues['grid_translate_delta']) {
          preview.ref.current.setPreviewSignal('grid_translate_delta', scaledValue);
        }
      }
    });
  }

  private restoreSignalValues() {
    for (let signalName of ['brush_x', 'brush_y', 'points_tuple', 'points_toggle']) {
      if (this.mainViewSignalValues[signalName]) {
        listeners.setSignalInGroup(ctrl.view, this.props.groupName, signalName, this.mainViewSignalValues[signalName]);
      }
    }
  }

  private onSignal(signalName, handler) {
    listeners.onSignalInGroup(ctrl.view, this.props.groupName, signalName, handler);
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
      mappingPreviews: this.getMappingPreviewDefs()
    });
  }

  private onClickMappingPreview(preview) {
    if (this.props.interactionRecord.mappingDef && this.props.interactionRecord.mappingDef.id === preview.id) {
      this.props.setMapping(null, this.props.interactionRecord.id);
    }
    else {
      if (!this.props.interactionRecord.selectionDef) {
        this.props.setSelection(this.state.selectionPreviews[0], this.props.interactionRecord.id);
      }
      this.props.setMapping(preview, this.props.interactionRecord.id);
    }
  }

  public render() {

    return (
      <div className={"preview-controller" + (this.state.selectionPreviews.length  ? " active" : "")}>
        {this.state.selectionPreviews.length ? <h2>Interactions</h2> : null}
        {this.state.selectionPreviews.length ? <h5>Selections</h5> : null}
        <div className="preview-scroll">
          {
            this.state.selectionPreviews.map((preview) => {
              preview.ref = React.createRef();
              const spec = editSignalsForPreview(this.state.spec, this.props.groupName, preview.signals);
              return (
                <div key={preview.id} className={this.props.interactionRecord && this.props.interactionRecord.selectionDef && this.props.interactionRecord.selectionDef.id === preview.id ? 'selected' : ''}>
                  <div className="preview-label">{preview.label}</div>
                  <InteractionPreview ref={preview.ref}
                    id={`preview-${preview.id}`}
                    groupName={this.props.groupName}
                    spec={spec}
                    onClick={() => this.onClickInteractionPreview(preview)}/>
                </div>
              )
            })
          }
        </div>
        {this.state.mappingPreviews.length ? <h5>Mappings</h5> : null}
        <div className="preview-scroll">
          {
            this.state.mappingPreviews.map((preview) => {
              preview.ref = React.createRef();
              const selectedInteractionSignals = [].concat.apply([], this.state.selectionPreviews.filter((def) => {
                return this.props.interactionRecord && this.props.interactionRecord.selectionDef && this.props.interactionRecord.selectionDef.id === def.id;
              }).map((def) => def.signals));
              let spec = editSignalsForPreview(this.state.spec, this.props.groupName, selectedInteractionSignals);
              spec = editMarksForPreview(spec, this.props.groupName, preview);
              if (preview.id === 'panzoom') {
                spec = editScalesForPreview(spec, this.props.groupName, preview);
              }
              return (
                <div key={preview.id} className={this.props.interactionRecord && this.props.interactionRecord.mappingDef && this.props.interactionRecord.mappingDef.id === preview.id ? 'selected' : ''}>
                  <div className="preview-label">{preview.label}</div>
                  <InteractionPreview ref={preview.ref}
                    id={`preview-${preview.id}`}
                    groupName={this.props.groupName}
                    spec={spec}
                    onClick={() => this.onClickMappingPreview(preview)}/>
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
