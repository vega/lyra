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

interface OwnProps {
  groupId: number;
  groupName: string;
  setActiveGroup: () => void;
}

interface StateProps {
  groups: Map<number, GroupRecord>;
  marksOfGroups: Map<number, MarkRecord[]>; // map of group ids to array of mark specs
  scaleInfo: ScaleInfo;
  fieldsOfGroup: string[];
  canDemonstrate: Boolean;
  datasets: Map<string, DatasetRecord>;
  interactionsOfGroup: InteractionRecord[];
}

interface DispatchProps {
  addInteraction: (groupId: number) => number; // return newly created interaction
  setSelection: (selection: SelectionRecord, id: number) => void;
  setApplication: (application: ApplicationRecord, id: number) => void;
  selectInteraction: (id: number) => void;
}

interface OwnState {
  isDemonstrating: boolean,
  isDemonstratingInterval: boolean,
  mainViewSignalValues: {[name: string]: any}, // name -> value
  selectionPreviews: SelectionRecord[];
  applicationPreviews: ApplicationRecord[];
  interactionId: number; // mutually exclusive with "interaction": for editing an interaction already in the store
  interaction: InteractionRecord; // mutual exclusive with "interactionId": for creating a new interaction
}

function mapStateToProps(state: State, ownProps: OwnProps): StateProps {
  const marks: Map<string, MarkRecord> = state.getIn(['vis', 'present', 'marks']);
  const groups: Map<number, GroupRecord> = marks.filter((mark: MarkRecord) => {
    return mark.type === 'group';
  }).mapEntries(([k, v]) => {
    return [Number(k), v as GroupRecord];
  });
  const group = groups.get(ownProps.groupId);

  const scaleInfo: ScaleInfo = getScaleInfoForGroup(state, ownProps.groupId);

  const isParsing = state.getIn(['vega', 'isParsing']);

  const canDemonstrate = Boolean(!isParsing && ctrl.view && (scaleInfo.xScaleName && scaleInfo.xFieldName || scaleInfo.yScaleName && scaleInfo.yFieldName));

  const marksOfGroups: Map<number, MarkRecord[]> = groups.map(group => {
    return group.marks.map(markId => {
      return state.getIn(['vis', 'present', 'marks', String(markId)]);
    }).filter((mark) => {
      return !(mark.type === 'group' || mark.name.indexOf('lyra') === 0);
    });
  });

  const datasets: Map<string, DatasetRecord> = state.getIn(['vis', 'present', 'datasets']);

  let fieldsOfGroup = [];
  const marksOfGroup = marksOfGroups.get(ownProps.groupId);
  if (marksOfGroup.length && marksOfGroup[0].from && marksOfGroup[0].from.data) {
    const dsId = String(marksOfGroup[0].from.data);
    const dataset: DatasetRecord =  datasets.get(dsId);
    const schema = dataset.get('_schema');
    const fields = schema.keySeq().toArray();
    fieldsOfGroup = fields;
  }

  // const encState: EncodingStateRecord = state.getIn(['inspector', 'encodings']);
  // const selId   = encState.get('selectedId');
  // const selType = encState.get('selectedType');
  // const isSelectedInteraction = selType === getType(selectInteraction);

  const interactionsOfGroup = group._interactions.map(interactionId => {
      return state.getIn(['vis', 'present', 'interactions', String(interactionId)]);
    });

  return {
    groups,
    marksOfGroups,
    scaleInfo,
    fieldsOfGroup,
    canDemonstrate,
    datasets,
    interactionsOfGroup
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

class InteractionPreviewController extends React.Component<OwnProps & StateProps & DispatchProps, OwnState> {

  constructor(props) {
    super(props);

    this.state = {
      isDemonstrating: false,
      isDemonstratingInterval: false,
      mainViewSignalValues: {},
      selectionPreviews: [],
      applicationPreviews: [],
      interactionId: null,
      interaction: Interaction({name: 'New Interaction'})
    };
  }

  public componentDidUpdate(prevProps: StateProps, prevState: OwnState) {
    if (!prevProps.canDemonstrate && this.props.canDemonstrate) {
      this.restoreSignalValues(this.props.groupName);
      this.onSignal(this.props.groupName, 'grid_translate_anchor', (name, value) => this.onMainViewGridSignal(name, value));
      this.onSignal(this.props.groupName, 'grid_translate_delta', (name, value) => this.onMainViewGridSignal(name, value));
      this.onSignal(this.props.groupName, 'brush_x', (name, value) => this.onMainViewIntervalSignal(name, value));
      this.onSignal(this.props.groupName, 'brush_y', (name, value) => this.onMainViewIntervalSignal(name, value));
      this.onSignal(this.props.groupName, 'points_tuple', (name, value) => this.onMainViewPointSignal(name, value));
      this.onSignal(this.props.groupName, 'points_toggle', (name, value) => this.onMainViewPointSignal(name, value));
    }

    if (prevState.isDemonstratingInterval !== this.state.isDemonstratingInterval) {
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
        const interactionId = this.props.addInteraction(this.props.groupId);
        this.props.setSelection(this.state.interaction.selection, interactionId);
        this.props.setApplication(this.state.interaction.application, interactionId);
        this.setState({
          interactionId,
          interaction: null
        });
      }
    }
  }

  private generatePreviews = debounce(250, () => {
      const groupId = this.props.groupId;
      const marksOfGroup = this.props.marksOfGroups.get(groupId);
      const scaleInfo = this.props.scaleInfo;
      const fieldsOfGroup = this.props.fieldsOfGroup;

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
        id: "color_" + this.state.isDemonstratingInterval,
        label: "Color",
        targetMarkName: exportName(mark.name),
        isDemonstratingInterval: this.state.isDemonstratingInterval,
        propertyName: "fill",
        defaultValue: "#797979"
      }));
      defs.push(MarkApplication({
        id: "opacity_" + this.state.isDemonstratingInterval,
        label: "Opacity",
        targetMarkName: exportName(mark.name),
        isDemonstratingInterval: this.state.isDemonstratingInterval,
        propertyName: "opacity",
        defaultValue: "0.2"
      }));
      if (mark.type === 'symbol') {
        defs.push(MarkApplication({
          id: "size_" + this.state.isDemonstratingInterval,
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
      const mark = marksOfOtherGroup.find(mark => mark.from && mark.from.data);
      if (mark) {
        const targetGroupName = exportName(otherGroup.name);
        const targetMarkName = exportName(mark.name);

        const datasetName = this.props.datasets.get(String(mark.from.data)).name;

        defs.push(TransformApplication({
          id: "filter_" + targetGroupName + "_" + this.state.isDemonstratingInterval,
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
    const intervalActive = (this.state.mainViewSignalValues['brush_x'] &&
      this.state.mainViewSignalValues['brush_y'] &&
      this.state.mainViewSignalValues['brush_x'][0] !== this.state.mainViewSignalValues['brush_x'][1] &&
      this.state.mainViewSignalValues['brush_y'][0] !== this.state.mainViewSignalValues['brush_y'][1]);
    const pointActive = Boolean(this.state.mainViewSignalValues['points_tuple']);

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
      }, this.props.setActiveGroup);
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
    if (this.state.mainViewSignalValues[name] !== value) {
      this.setState({
        mainViewSignalValues: {...this.state.mainViewSignalValues, [name]: value}
      }, () => {
        this.updateIsDemonstrating();
        this.updatePreviewSignals(name, value);
      });
    }
  }

  private onMainViewIntervalSignal(name, value) {
    if (this.state.mainViewSignalValues[name] !== value) {
      this.setState({
        mainViewSignalValues: {...this.state.mainViewSignalValues, [name]: value}
      }, () => {
        this.updateIsDemonstrating();
        this.updatePreviewSignals(name, value);
      });
    }
  }

  private onMainViewGridSignal(name, value) {
    this.setState({
      mainViewSignalValues: {...this.state.mainViewSignalValues, [name]: value}
    }, () => {
      this.updatePreviewSignals(name, value);
    });
  }

  private restoreSignalValues(groupName) {
    for (let signalName of ['brush_x', 'brush_y', 'points_tuple', 'points_toggle']) {
      if (this.state.mainViewSignalValues[signalName]) {
        console.log('restore', groupName, signalName, this.state.mainViewSignalValues[signalName]);
        listeners.setSignalInGroup(ctrl.view, groupName, signalName, this.state.mainViewSignalValues[signalName]);
      }
    }
  }

  private onSignal(groupName, signalName, handler) {
    listeners.onSignalInGroup(ctrl.view, groupName, signalName, handler);
  }

  private previewRefs = {}; // id -> ref

  private onClickInteractionPreview(preview: SelectionRecord | ApplicationRecord) {
    console.log('click preview', this.props.groupName);
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

  private getSignalBubbles(scaleInfo, isDemonstratingInterval) {
    const signals = [];

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
    const options = this.props.fieldsOfGroup.map(field => <option key={field} value={field}>{field}</option>);

    return <div>
      <select value={preview.field} onChange={e => this.onSelectProjectionField(preview, e.target.value)}>
        {options}
      </select>
    </div>
  }

  private getInteractionOptions() {
    const interactionOptions = this.props.interactionsOfGroup.map((interaction) => {
      return <option key={interaction.name} value={interaction.id}>{interaction.name}</option>;
    });

    interactionOptions.unshift(<option key={'New Interaction'} value={0}>{'New Interaction'}</option>)

    return <select value={this.state.interactionId} onChange={e => this.onSelectInteraction(Number(e.target.value))}>
      {interactionOptions}
    </select>;
  }

  public render() {
    const interaction = this.state.interaction ? this.state.interaction : this.props.interactionsOfGroup.find(interaction => interaction.id === this.state.interactionId);
    //
    return (
      <div className={"preview-controller" + (this.state.isDemonstrating  ? " active" : "")}>
        {this.state.isDemonstrating ? (
          <div className="preview-header">
            <h2>Interactions</h2>
            {this.getInteractionOptions()}
            <div className="signals-container">
              {this.getSignalBubbles(this.props.scaleInfo, this.state.isDemonstratingInterval)}
            </div>
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
                    groupName={this.props.groupName}
                    preview={preview}
                    initialSignals={this.state.mainViewSignalValues}
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
                    groupName={this.props.groupName}
                    preview={preview}
                    initialSignals={this.state.mainViewSignalValues}
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
