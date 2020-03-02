import * as React from 'react';
import {Map} from 'immutable';
import { connect } from 'react-redux';
import {State} from '../../store';
import {getScaleInfoForGroup, ScaleSimpleType} from '../../ctrl/demonstrations';
import {Interaction, ApplicationRecord, ScaleInfo, PointSelectionRecord, IntervalSelectionRecord, SelectionRecord, IntervalSelection, PointSelection, MarkApplication, ScaleApplication, TransformApplication, InteractionRecord} from '../../store/factory/Interaction';
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
import {Icon} from '../Icon';

const ctrl = require('../../ctrl');
const listeners = require('../../ctrl/listeners');
const assets = require('../../util/assets');

interface StateProps {
  groups: Map<number, GroupRecord>;
  scaleInfoForGroups: Map<number, ScaleInfo>; // map of group ids to scale info
  marksOfGroups: Map<number, MarkRecord[]>; // map of group ids to array of mark specs
  fieldsOfGroups: Map<number, string[]>; // map of group ids to array of fields
  canDemonstrateGroups: Map<number, Boolean>;
  datasets: Map<string, DatasetRecord>;
  interactionsOfGroups: Map<number, InteractionRecord[]>;
}

interface DispatchProps {
  addInteraction: (groupId: number) => number; // return newly created interaction
  setSelection: (selection: SelectionRecord, id: number) => void;
  setApplication: (application: ApplicationRecord, id: number) => void;
  selectInteraction: (id: number) => void;
}

interface OwnState {
  groupId: number; // active group (the one that the user is demonstrating on)
  groupName: string; // active group (the one that the user is demonstrating on)
  isDemonstrating: boolean,
  isDemonstratingInterval: boolean,
  selectionPreviews: SelectionRecord[];
  applicationPreviews: ApplicationRecord[];
  interactionId: number; // mutually exclusive with "interaction": for editing an interaction already in the store
  interaction: InteractionRecord; // mutual exclusive with "interactionId": for creating a new interaction
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

  const interactionsOfGroups = groups.map(group => {
    return group._interactions.map(interactionId => {
      return state.getIn(['vis', 'present', 'interactions', String(interactionId)]);
    })
  });

  return {
    groups,
    scaleInfoForGroups,
    marksOfGroups,
    fieldsOfGroups,
    canDemonstrateGroups,
    datasets,
    interactionsOfGroups
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
    setSelection: (selection, id) => {
      dispatch(setSelection(selection, id));
    },
    setApplication: (application, id) => {
      dispatch(setApplication(application, id));
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
      isDemonstrating: false,
      isDemonstratingInterval: false,
      groupId: null,
      groupName: null,
      selectionPreviews: [],
      applicationPreviews: [],
      interactionId: null,
      interaction: Interaction({name: 'New Interaction'})
    };
  }

  public componentDidUpdate(prevProps: StateProps, prevState: OwnState) {
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

    if (prevState.interactionId !== this.state.interactionId) {
      if (this.state.interactionId) {
        this.setState({
          interaction: null
        });
      }
      else {
        this.setState({
          interactionId: null,
          interaction: Interaction({name: 'New Interaction'})
        });
      }
    }

    if (prevState.interaction !== this.state.interaction) {
      if (this.state.interaction && !this.state.interaction.id && this.state.interaction.selection && this.state.interaction.application) {
        const interactionId = this.props.addInteraction(this.state.groupId);
        this.props.setSelection(this.state.interaction.selection, interactionId);
        this.props.setApplication(this.state.interaction.application, interactionId);
        this.setState({
          interactionId,
          interaction: null
        });
      }
    }
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
        }),
        PointSelection({
          ptype: 'single',
          id: 'single_project',
          label: 'Single point (by field)',
          field: fieldsOfGroup[0]
        }),
        PointSelection({
          ptype: 'multi',
          id: 'multi_project',
          label: 'Multi point (by field)',
          field: fieldsOfGroup[0]
        })
      ];
      return defs;
    }
  }

  private generateApplicationPreviews(groupId: number, marksOfGroup: MarkRecord[], scaleInfo: ScaleInfo): ApplicationRecord[] {
    const defs: ApplicationRecord[] = [];

    // TODO(jzong): could add a heuristic -- better way to sort these?
    // TODO(jzong): change mark to dropdown
    marksOfGroup.forEach(mark => {
      defs.push(MarkApplication({
        id: "color",
        label: "Color",
        targetMarkName: exportName(mark.name),
        isDemonstratingInterval: this.state.isDemonstratingInterval,
        propertyName: "fill",
        defaultValue: "#797979"
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

  private updateIsDemonstrating() {
    const intervalActive = (this.mainViewSignalValues['brush_x'] &&
      this.mainViewSignalValues['brush_y'] &&
      this.mainViewSignalValues['brush_x'][0] !== this.mainViewSignalValues['brush_x'][1] &&
      this.mainViewSignalValues['brush_y'][0] !== this.mainViewSignalValues['brush_y'][1]);
    const pointActive = Boolean(this.mainViewSignalValues['points_tuple']);

    const isDemonstrating = intervalActive || pointActive;
    const isDemonstratingInterval = intervalActive || !pointActive;

    this.setState({
      isDemonstratingInterval
    });

    if (!isDemonstrating) {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.setState({
          isDemonstrating
        });
      }, 250);
    }
    else {
      clearTimeout(this.timeout);
      this.timeout = null;
      this.setState({
        isDemonstrating
      });
    }
  }

  private timeout;

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

    this.updateIsDemonstrating();

    this.updatePreviewSignals(name, value);
  }

  private onMainViewIntervalSignal(name, value) {
    this.mainViewSignalValues[name] = value;

    this.updateIsDemonstrating();

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

  private onClickInteractionPreview(preview: SelectionRecord | ApplicationRecord) {
    switch (preview.type) {
      case 'point':
      case 'interval':
        if (this.state.interactionId) {
          this.props.setSelection(preview as SelectionRecord, this.state.interactionId);
        }
        else {
          this.setState({
            interaction: this.state.interaction.set('selection', preview as SelectionRecord)
          });
        }
        break;
      case 'mark':
      case 'scale':
      case 'transform':
        if (this.state.interactionId) {
          this.props.setApplication(preview as ApplicationRecord, this.state.interactionId);
        }
        else {
          this.setState({
            interaction: this.state.interaction.set('application', preview as ApplicationRecord)
          });
        }
        break;
    }
  }

  private onSelectProjectionField(preview: SelectionRecord, field: string) {
    const newPreview = (preview as PointSelectionRecord).set('field', field);
    this.setState({
      selectionPreviews: this.state.selectionPreviews.map(p => {
        if (p === preview) {
          return newPreview;
        }
        return p;
      })
    }, () => {
      this.props.setSelection(newPreview, this.state.interactionId);
    });
  }

  private onSelectInteraction(interactionId: number) {
    this.setState({
      interactionId: interactionId ? interactionId : null
    })
  }

  private closePreview() {
    this.setState({
      isDemonstrating: false
    })
  }

  private getSignalBubbles(scaleInfoForGroups, groupId, isDemonstratingInterval) {
    const signals = [];
    const scaleInfo = scaleInfoForGroups.get(groupId);

    const handleDragStart = (evt) => {
      console.log(evt.target.dataset.signal);
      evt.dataTransfer.setData('signalName', evt.target.dataset.signal);
    }

    if (isDemonstratingInterval) {
      if (scaleInfo.xScaleName) {
        signals.push(<div draggable className="signal" onDragStart={handleDragStart} data-signal={`brush_${scaleInfo.xScaleName}`}>{`brush_${scaleInfo.xScaleName}`}</div>)
      }
      if (scaleInfo.yScaleName) {
        signals.push(<div draggable className="signal" onDragStart={handleDragStart} data-signal={`brush_${scaleInfo.yScaleName}`}>{`brush_${scaleInfo.yScaleName}`}</div>)
      }
      if (scaleInfo.xFieldName) {
        signals.push(<div draggable className="signal" onDragStart={handleDragStart} data-signal={`brush_${scaleInfo.xFieldName}`}>{`brush_${scaleInfo.xFieldName}`}</div>)
      }
      if (scaleInfo.yFieldName) {
        signals.push(<div draggable className="signal" onDragStart={handleDragStart} data-signal={`brush_${scaleInfo.yFieldName}`}>{`brush_${scaleInfo.yFieldName}`}</div>)
      }
    }
    else {
      signals.push(<div draggable className="signal" onDragStart={handleDragStart} data-signal="points_tuple">points</div>)
    }
    return signals;
  }

  private getFieldOptions(preview) {
    // TODO(jzong): add heuristic here by sorting the fields by frequency
    const options = this.props.fieldsOfGroups.get(this.state.groupId).map(field => <option key={field} value={field}>{field}</option>);

    return <div>
      <select value={preview.field} onChange={e => this.onSelectProjectionField(preview, e.target.value)}>
        {options}
      </select>
    </div>
  }

  private getInteractionOptions() {
    if (!this.state.groupId) return null;

    const interactionOptions = this.props.interactionsOfGroups.get(this.state.groupId).map((interaction) => {
      return <option key={interaction.name} value={interaction.id}>{interaction.name}</option>;
    });

    interactionOptions.unshift(<option key={'New Interaction'} value={0}>{'New Interaction'}</option>)

    return <select value={this.state.interactionId} onChange={e => this.onSelectInteraction(Number(e.target.value))}>
      {interactionOptions}
    </select>;
  }

  public render() {
    const interaction = this.state.interaction ? this.state.interaction : this.props.interactionsOfGroups.get(this.state.groupId).filter(interaction => interaction.id === this.state.interactionId)[0];
    //
    return (
      <div className={"preview-controller" + (this.state.isDemonstrating  ? " active" : "")}>
        {this.state.isDemonstrating ? (
          <div className="preview-header">
            <h2>Interactions</h2>
            {this.getInteractionOptions()}
            {this.getSignalBubbles(this.props.scaleInfoForGroups, this.state.groupId, this.state.isDemonstratingInterval)}
            <div className="preview-close">
              <Icon glyph={assets.close} onClick={() => this.closePreview()} />
            </div>
          </div>
        ) : null}
        {this.state.selectionPreviews.length ? <h5>Selections</h5> : null}
        <div className="preview-scroll">
          {
            this.state.selectionPreviews.map((preview) => {
              if (!this.previewRefs[preview.id]) {
                this.previewRefs[preview.id] = React.createRef();
              }
              return (
                <div key={preview.id} className={interaction && interaction.selection && interaction.selection.id === preview.id ? 'selected' : ''}>
                  <div className="preview-label">{preview.label}
                    {
                      preview.id.includes('project') ? this.getFieldOptions(preview) : ''
                    }
                  </div>
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
                <div key={preview.id} className={interaction && interaction.application && interaction.application.id === preview.id ? 'selected' : ''}>
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
