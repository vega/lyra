import {Map} from 'immutable';
import * as React from 'react';
import {connect} from 'react-redux';
import {updateHistoryProperty} from '../../actions/historyActions';
import {State} from '../../store';
import {HistoryItem} from './HistoryItem';
import {MarkRecord} from '../../store/factory/Mark';
import exportName from '../../util/exportName';
import {mapNestedMarksOfGroup, editSignals} from '../../ctrl/demonstrations';
import duplicate from "../../util/duplicate";
import {Spec} from "vega";
import { Icon } from '../Icon';
import {ExpandedLayers} from '../../store/factory/Inspector';
import {toggleLayers} from '../../actions/inspectorActions';

const getIn = require('../../util/immutable-utils').getIn;
const assets = require('../../util/assets');
const HEIGHT = 100;
const WIDTH = 100;

interface OwnProps {
}
interface StateProps {
  history: any[];
  groupNames: string[];
  expandedLayers?: ExpandedLayers;
}

interface DispatchProps {
  updateHistoryProperty: (payload: {property: string, value: any}, id: number) => void;
  toggleGroup?: () => void;
}

function mapStateToProps(state: State): StateProps {
  const marks: Map<string, MarkRecord> = state.getIn(['vis', 'present', 'marks']);
  const groupNames = marks.filter((mark: MarkRecord) => {
    return mark.type === 'group';
  }).map((v) => {
    return exportName(v.name);
  }).toList().toJSON();
  const history = state.getIn(['vis', '_allStates']);
  return {
    history,
    groupNames: groupNames,
    expandedLayers: state.getIn(['inspector', 'encodings', 'expandedLayers']),
  };
}

function mapDispatchToProps(dispatch, ownProps): DispatchProps {
  return {
    updateHistoryProperty,
    toggleGroup: function() {
      dispatch(toggleLayers([1000])); // todo(ej): have a better id for this state.
    }
  };
}

class BaseHistoryList extends React.Component<OwnProps & StateProps & DispatchProps> {

  public render() {
    const isExpanded = this.props.expandedLayers[1000]; // todo(ej): have a better id for this state. use history state
    const groupClass = isExpanded ? 'expanded' : 'contracted';
    return (
      <div id='history-toolbar' className={groupClass}>
        <h2 onClick={this.props.toggleGroup}>
          <Icon glyph={assets['group-' + groupClass]} className="icon" />
          History
        </h2>
        {isExpanded ? <div id='history-list' >
          {this.props.history.map(
            (item, idx) => {
              return <HistoryItem id={idx} key={idx+''} history={item} groupNames={this.props.groupNames} width={WIDTH} height={HEIGHT} />
            }
          )}
        </div> : null}
      </div>
    );
  }
}

export function cleanHistorySpec(sceneSpec, width: number, height: number): Spec {
  let interactionSignals = ["brush_", "point_", "points_", "mouse_", "grid_", "unit", "key_modifier"];
  const sceneUpdated = duplicate(sceneSpec);
  sceneUpdated.autosize = "none";

  sceneUpdated.marks = sceneUpdated.marks.map(markSpec => {
    if (markSpec.name && markSpec.type === 'group') { // don't touch manipulators, which don't have names
      const oldWidth = markSpec.encode?.update?.width?.value || 640;
      const oldHeight = markSpec.encode?.update?.height?.value || 360;
      const wScale = width / oldWidth; // preview width / main view width
      const hScale = height / oldHeight; // preview height / main view height
      let scale = (wScale + hScale) / 2;

      // remove interaction
      markSpec.marks = markSpec.marks.filter((subMarkSpec) => {
        return !subMarkSpec.clip;
      });
      markSpec.signals = markSpec.signals.filter((sig) => {
        return !interactionSignals.some((interationSig) => sig.name.includes(interationSig));
      });

      markSpec.axes = markSpec.axes.map((axis) => {
        axis.encode.labels.update.fontSize.value *= scale; // labels
        axis.encode.grid.update.strokeWidth.value *=scale; // grid
        axis.encode.ticks.update.strokeWidth.value *=scale; // ticks
        axis.encode.title.update.fontSize.value *=scale; // title
        return axis;

      });

      markSpec.legends = markSpec.legends.map((legend) => {
          legend.titleFontSize *=scale; // title
          legend.encode.title.update.fontSize.value *=scale; // title
          legend.encode.labels.update.fontSize.value *=scale; // labels
          legend.encode.legend.update.strokeWidth.value *=scale; // strokewidth
          legend.encode.symbols.update.strokeWidth.value *=scale; // symbols
          legend.encode.symbols.update.size.value *=scale; // symbols
          return legend;
      });


      markSpec.encode.update.x = {"value": 0};
      markSpec.encode.update.y = {"value": 0};
      markSpec.encode.update.width = {"signal": "width"};
      markSpec.encode.update.height = {"signal": "height"};

      markSpec = mapNestedMarksOfGroup(markSpec, mark => {
        if (mark.type === 'symbol' && mark.encode?.update?.size) {
          if (Array.isArray(mark.encode.update.size) && mark.encode?.update?.size.length == 2) {
            mark.encode.update.size = mark.encode.update.size.map(def => {
              if (def.value) {
                return {
                  ...def,
                  value: def.value * (wScale + hScale) / 2
                }
              }
              return def;
            })
          }
          else if (mark.encode.update.size.value) {
            mark.encode.update.size.value *= (wScale + hScale) / 2;
          }
        }
        if (mark.type === 'text') {
          if (mark.encode?.update?.fontSize?.value) {
            mark.encode.update.fontSize.value /= 2;
          }
          if (mark.encode?.update?.dx?.value) {
            mark.encode.update.dx.value *= wScale;
          }
          if (mark.encode?.update?.dy?.value) {
            mark.encode.update.dy.value *= hScale;
          }
          if (mark.encode?.update?.x?.value) {
            mark.encode.update.x.value *= wScale;
          }
          if (mark.encode?.update?.y?.value) {
            mark.encode.update.y.value *= hScale;
          }
        }
        if (mark.type === 'line' && mark.encode?.update?.strokeWidth?.value) {
          mark.encode.update.strokeWidth.value /= 2;
        }
        if (mark.encode?.update?.x?.value != null) {
          mark.encode.update.x.value *= scale;
        }
        if (mark.encode?.update?.y?.value != null) {
          mark.encode.update.y.value *= scale;
        }
        return mark;
      });

      markSpec.scales = markSpec.scales.map(scale => {
        if (scale.range) {
          const range = scale.range;
          if (Array.isArray(range) && range.length == 2 && !range.some(isNaN)) {
            scale.range = range.map(n => n / 10);
          }
          if (range.step && range.step.signal) {
            markSpec.signals = markSpec.signals.map(signal => {
              if (signal.name === range.step.signal) {
                signal.value /= 2;
              }
              return signal;
            });
          }
        }
        return scale;
      })
    }
    return markSpec;
  });

  return addBaseSignals(sceneUpdated);
}

function addBaseSignals(sceneSpec) {
  const sceneUpdated = duplicate(sceneSpec);
  sceneUpdated.marks = sceneUpdated.marks.map(markSpec => {
    if (markSpec.name && markSpec.type === 'group') {
      markSpec.signals = editSignals(markSpec.signals, baseSignals);
    }
    return markSpec;
  });
  return sceneUpdated;
}

const baseSignals = [
  {
    name: "width",
    init: String(WIDTH)
  },
  {
    name: "height",
    init: String(HEIGHT)
  }
];

export const HistoryList = connect(mapStateToProps, mapDispatchToProps)(BaseHistoryList);
