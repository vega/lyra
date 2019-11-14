import {GroupMark, Mark} from "vega";
import {GuideRecord} from "../store/factory/Guide";
import {Map} from 'immutable';
import {ScaleRecord} from "../store/factory/Scale";
import {State} from "../store";
import {LyraSelectionPreviewDef, LyraMappingPreviewDef, ScaleInfo} from "../components/interactions/InteractionPreviewController";
import duplicate from "../util/duplicate";
import {LyraMarkType, MarkRecord} from "../store/factory/Mark";
import {GroupRecord} from "../store/factory/marks/Group";
import exportName from "../util/exportName";
import {InteractionRecord} from "../store/factory/Interaction";

function conditionalHelpersForScales(scaleInfo: ScaleInfo) {
  const {xScaleName, yScaleName, xFieldName, yFieldName} = scaleInfo;
  return {
    ifXElse: (e1, e2) => xScaleName && xFieldName ? e1 : e2,
    ifYElse: (e1, e2) => yScaleName && yFieldName ? e1 : e2,
    ifXY: (e1) => xScaleName && xFieldName && yScaleName && yFieldName ? e1 : ''
  }
}

export function demonstrationDatasets(sceneSpec, state: State) {
  // add stores for interactions
  sceneSpec.marks.forEach(markSpec => {
    if (markSpec.name && markSpec.type === 'group') {
      const groupName = markSpec.name;
      const data = sceneSpec.data || (sceneSpec.data = []);
      sceneSpec.data = [...data,
        {"name": `brush_store_${groupName}`},
        {"name": `grid_store_${groupName}`},
        {"name": `points_store_${groupName}`},
      ];
    }
  });
  // check for interactions that define transforms and apply them
  const interactionState: Map<string, InteractionRecord> = state.getIn(['vis', 'present', 'interactions']);
  interactionState.filter((interaction) => {
    return interaction.mappingDef && interaction.mappingDef.id.indexOf('filter') === 0 && interaction.mappingDef.datasetProperties;
  }).forEach((interaction) => {
    const datasetProps = interaction.mappingDef.datasetProperties;
    const data = sceneSpec.data || (sceneSpec.data = []);
    sceneSpec.data = [...data, datasetProps];
  });
}

export function demonstrations(groupSpec, groupId: number, state: State) {
  if (groupSpec.name) { // don't touch manipulators, which don't have names
    const scaleInfo = getScaleInfoForGroup(state, groupId);
    const {xScaleName, xFieldName, yScaleName, yFieldName} = scaleInfo;

    if (!(xScaleName && xFieldName || yScaleName && yFieldName)) {
      // cannot currently demonstrate
      // likely the user has not created scales yet
      return groupSpec;
    }

    return addMarksToGroup(addSignalsToGroup(groupSpec, scaleInfo), scaleInfo);
  }
  return groupSpec;
}

function addMarksToGroup(groupSpec: GroupMark, scaleInfo: ScaleInfo): GroupMark {
  const {ifXElse, ifYElse, ifXY} = conditionalHelpersForScales(scaleInfo);
  const marks = groupSpec.marks || (groupSpec.marks = []);
  const groupName = groupSpec.name;
  groupSpec.marks = [...marks,
    {
      "name": "lyra_brush_brush_bg",
      "type": "rect",
      "clip": true,
      "encode": {
        "enter": {
          "fill": {
            "value": "#333"
          },
          "fillOpacity": {
            "value": 0.125
          }
        },
        "update": {
          "x": [
            Object.assign({
              "test": `data(\"brush_store_${groupName}\").length && data(\"brush_store_${groupName}\")[0].unit === \"\"`,
            }, ifXElse({"signal": "lyra_brush_x[0]"}, {"value": "0"})),
            {
              "value": 0
            }
          ],
          "y": [
            Object.assign({
              "test": `data(\"brush_store_${groupName}\").length && data(\"brush_store_${groupName}\")[0].unit === \"\"`,
            }, ifYElse({"signal": "lyra_brush_y[0]"}, {"value": "0"})),
            {
              "value": 0
            }
          ],
          "x2": [
            Object.assign({
              "test": `data(\"brush_store_${groupName}\").length && data(\"brush_store_${groupName}\")[0].unit === \"\"`,
            }, ifXElse({"signal": "lyra_brush_x[1]"}, {"signal": "width"})),
            {
              "value": 0
            }
          ],
          "y2": [
            Object.assign({
              "test": `data(\"brush_store_${groupName}\").length && data(\"brush_store_${groupName}\")[0].unit === \"\"`,
            }, ifYElse({"signal": "lyra_brush_y[1]"}, {"signal": "height"})),
            {
              "value": 0
            }
          ]
        }
      }
    },
    {
      "name": "lyra_brush_brush",
      "type": "rect",
      "clip": true,
      "encode": {
        "enter": {
          "fill": {
            "value": "transparent"
          }
        },
        "update": {
          "x": [
            Object.assign({
              "test": `data(\"brush_store_${groupName}\").length && data(\"brush_store_${groupName}\")[0].unit === \"\"`,
            }, ifXElse({"signal": "lyra_brush_x[0]"}, {"value": "0"})),
            {
              "value": 0
            }
          ],
          "y": [
            Object.assign({
              "test": `data(\"brush_store_${groupName}\").length && data(\"brush_store_${groupName}\")[0].unit === \"\"`,
            }, ifYElse({"signal": "lyra_brush_y[0]"}, {"value": "0"})),
            {
              "value": 0
            }
          ],
          "x2": [
            Object.assign({
              "test": `data(\"brush_store_${groupName}\").length && data(\"brush_store_${groupName}\")[0].unit === \"\"`,
            }, ifXElse({"signal": "lyra_brush_x[1]"}, {"signal": "width"})),
            {
              "value": 0
            }
          ],
          "y2": [
            Object.assign({
              "test": `data(\"brush_store_${groupName}\").length && data(\"brush_store_${groupName}\")[0].unit === \"\"`,
            }, ifYElse({"signal": "lyra_brush_y[1]"}, {"signal": "height"})),
            {
              "value": 0
            }
          ],
          "stroke": [
            {
              "test": ifXElse("lyra_brush_x[0] !== lyra_brush_x[1]", "") + ifXY(" && ") + ifYElse("lyra_brush_y[0] !== lyra_brush_y[1]", ""),
              "value": "white"
            },
            {
              "value": null
            }
          ]
        }
      }
    }
  ];
  return groupSpec;
}

function addSignalsToGroup(groupSpec, scaleInfo: ScaleInfo) {
  const {xScaleName, yScaleName, xFieldName, yFieldName} = scaleInfo;
  const {ifXElse, ifYElse, ifXY} = conditionalHelpersForScales(scaleInfo);
  const groupName = groupSpec.name;
  const signals = groupSpec.signals || (groupSpec.signals = []);
  groupSpec.signals = [...signals,
    {
      "name": "lyra_brush_is_x_encoding",
      "init": "false"
    },
    {
      "name": "lyra_brush_is_y_encoding",
      "init": "false"
    },
    {
      "name": "lyra_brush_x",
      "update": "lyra_brush_is_y_encoding ? [width, 0] : brush_x"
    },
    {
      "name": "lyra_brush_y",
      "update": "lyra_brush_is_x_encoding ? [0, height] : brush_y"
    },
    {
      "name": "unit",
      "value": {},
      "on": [
        {
          "events": "mousemove",
          "update": "isTuple(group()) ? group() : unit"
        }
      ]
    },
    {
      "name": "brush",
      "update": `vlSelectionResolve(\"brush_store_${groupName}\")`
    },
    {
      "name": "grid",
      "update": `vlSelectionResolve(\"grid_store_${groupName}\")`
    },
    {
      "name": "brush_x",
      "value": [],
      "on": [
        {
          "events": {
            "source": "scope",
            "type": "mousedown",
            "filter": [
              "!event.item || event.item.mark.name !== \"lyra_brush_brush\""
            ]
          },
          "update": "[x(unit), x(unit)]"
        },
        {
          "events": {
            "source": "window",
            "type": "mousemove",
            "consume": true,
            "between": [
              {
                "source": "scope",
                "type": "mousedown",
                "filter": [
                  "!event.item || event.item.mark.name !== \"lyra_brush_brush\""
                ]
              },
              {
                "source": "window",
                "type": "mouseup"
              }
            ]
          },
          "update": "[brush_x[0], clamp(x(unit), 0, width)]"
        },
        {
          "events": {
            "signal": "brush_scale_trigger"
          },
          "update": ifXElse(`isArray(brush_${xFieldName}_${xScaleName}) && length(brush_${xFieldName}_${xScaleName}) == 2 ? [scale(\"${xScaleName}\", brush_${xFieldName}_${xScaleName}[0]), scale(\"${xScaleName}\", brush_${xFieldName}_${xScaleName}[1])] : [0, 0]`, "[width, 0]")
        },
        {
          "events": {
            "signal": "brush_translate_delta"
          },
          "update": "clampRange(panLinear(brush_translate_anchor.extent_x, brush_translate_delta.x / span(brush_translate_anchor.extent_x)), 0, width)"
        },
        {
          "events": {
            "signal": "brush_zoom_delta"
          },
          "update": "clampRange(zoomLinear(brush_x, brush_zoom_anchor.x, brush_zoom_delta), 0, width)"
        },
        {
          "events": [
            {
              "source": "scope",
              "type": "dblclick"
            }
          ],
          "update": "[0, 0]"
        }
      ]
    },
    {
      "name": ifXElse(`brush_${xFieldName}_${xScaleName}`, "brush_x_field_undefined"),
      "on": ifXElse([
        {
          "events": {
            "signal": "lyra_brush_x"
          },
          "update": `lyra_brush_x[0] === lyra_brush_x[1] ? null : invert(\"${xScaleName}\", lyra_brush_x)`
        }
      ], [])
    },
    {
      "name": "brush_y",
      "value": [],
      "on": [
        {
          "events": {
            "source": "scope",
            "type": "mousedown",
            "filter": [
              "!event.item || event.item.mark.name !== \"lyra_brush_brush\""
            ]
          },
          "update": "[y(unit), y(unit)]"
        },
        {
          "events": {
            "source": "window",
            "type": "mousemove",
            "consume": true,
            "between": [
              {
                "source": "scope",
                "type": "mousedown",
                "filter": [
                  "!event.item || event.item.mark.name !== \"lyra_brush_brush\""
                ]
              },
              {
                "source": "window",
                "type": "mouseup"
              }
            ]
          },
          "update": "[brush_y[0], clamp(y(unit), 0, height)]"
        },
        {
          "events": {
            "signal": "brush_scale_trigger"
          },
          "update": ifYElse(`isArray(brush_${yFieldName}_${yScaleName}) && length(brush_${yFieldName}_${yScaleName}) == 2 ? [scale(\"${yScaleName}\", brush_${yFieldName}_${yScaleName}[0]), scale(\"${yScaleName}\", brush_${yFieldName}_${yScaleName}[1])] : [0, 0]`, "[0, height]")
        },
        {
          "events": {
            "signal": "brush_translate_delta"
          },
          "update": "clampRange(panLinear(brush_translate_anchor.extent_y, brush_translate_delta.y / span(brush_translate_anchor.extent_y)), 0, height)"
        },
        {
          "events": {
            "signal": "brush_zoom_delta"
          },
          "update": "clampRange(zoomLinear(brush_y, brush_zoom_anchor.y, brush_zoom_delta), 0, height)"
        },
        {
          "events": [
            {
              "source": "scope",
              "type": "dblclick"
            }
          ],
          "update": "[0, 0]"
        }
      ]
    },
    {
      "name": ifYElse(`brush_${yFieldName}_${yScaleName}`, "brush_y_field_undefined"),
      "on": ifYElse([
        {
          "events": {
            "signal": "lyra_brush_y"
          },
          "update": `lyra_brush_y[0] === lyra_brush_y[1] ? null : invert(\"${yScaleName}\", lyra_brush_y)`
        }
      ], [])
    },
    {
      "name": "brush_scale_trigger",
      "value": {},
      "on": [
        {
          "events": [].concat(ifXElse([
                      {
                        "scale": "x"
                      }
                    ], [])).concat(ifYElse([
                      {
                        "scale": "y"
                      }
                    ], [])),
          "update":
            ifXElse(`(!isArray(brush_${xFieldName}_${xScaleName}) || (+invert(\"${xScaleName}\", lyra_brush_x)[0] === +brush_${xFieldName}_${xScaleName}[0] && +invert(\"${xScaleName}\", lyra_brush_x)[1] === +brush_${xFieldName}_${xScaleName}[1]))`, '') +
            ifXY(" && ") +
            ifYElse(`(!isArray(brush_${yFieldName}_${yScaleName}) || (+invert(\"${yScaleName}\", lyra_brush_y)[0] === +brush_${yFieldName}_${yScaleName}[0] && +invert(\"${yScaleName}\", lyra_brush_y)[1] === +brush_${yFieldName}_${yScaleName}[1]))`, '') +
            ` ? brush_scale_trigger : {}`
        }
      ]
    },
    {
      "name": "brush_tuple",
      "on": [
        {
          "events": [
            {
              "signal": ifXElse(`brush_${xFieldName}_${xScaleName}`, "") + ifXY(" || ") + ifYElse(`brush_${yFieldName}_${yScaleName}`, "")
            }
          ],
          "update": ifXElse(`brush_${xFieldName}_${xScaleName}`, "") + ifXY(" && ") + ifYElse(`brush_${yFieldName}_${yScaleName}`, "") + " ? {unit: \"\", fields: tuple_fields, values: [" +
                        ifXElse(`brush_${xFieldName}_${xScaleName}`, "") + ifXY(",") + ifYElse(`brush_${yFieldName}_${yScaleName}`, "") + "]} : null"
        }
      ]
    },
    {
      "name": "tuple_fields",
      "value": [].concat(ifXElse([
          {
            "field": xFieldName,
            "channel": "x",
            "type": "R"
          }
        ], [])).concat(ifYElse([
          {
            "field": yFieldName,
            "channel": "y",
            "type": "R"
          }
        ], []))
    },
    {
      "name": "brush_translate_anchor",
      "value": {},
      "on": [
        {
          "events": [
            {
              "source": "scope",
              "type": "mousedown",
              "markname": "lyra_brush_brush"
            }
          ],
          // "update": "{x: x(unit), y: y(unit)" + ifXElse(", extent_x: slice(lyra_brush_x)", "") + ifYElse(", extent_y: slice(lyra_brush_y)", "") + "}"
          "update": "{x: x(unit), y: y(unit), extent_x: slice(lyra_brush_x), extent_y: slice(lyra_brush_y)}"
        }
      ]
    },
    {
      "name": "brush_translate_delta",
      "value": {},
      "on": [
        {
          "events": [
            {
              "source": "window",
              "type": "mousemove",
              "consume": true,
              "between": [
                {
                  "source": "scope",
                  "type": "mousedown",
                  "markname": "lyra_brush_brush"
                },
                {
                  "source": "window",
                  "type": "mouseup"
                }
              ]
            }
          ],
          "update": "{x: brush_translate_anchor.x - x(unit), y: brush_translate_anchor.y - y(unit)}"
        }
      ]
    },
    {
      "name": "brush_zoom_anchor",
      "on": [
        {
          "events": [
            {
              "source": "scope",
              "type": "wheel",
              "consume": true,
              "markname": "lyra_brush_brush"
            }
          ],
          "update": "{x: x(unit), y: y(unit)}"
        }
      ]
    },
    {
      "name": "brush_zoom_delta",
      "on": [
        {
          "events": [
            {
              "source": "scope",
              "type": "wheel",
              "consume": true,
              "markname": "lyra_brush_brush"
            }
          ],
          "force": true,
          "update": "pow(1.001, event.deltaY * pow(16, event.deltaMode))"
        }
      ]
    },
    {
      "name": "brush_modify",
      "update": `modify(\"brush_store_${groupName}\", brush_tuple, true)`
    },

    {
      "name": ifXElse(`grid_${xFieldName}_${xScaleName}`, "grid_x_field_undefined"),
      "on": ifXElse([
        {
          "events": {"signal": "grid_translate_delta"},
          "update": "panLinear(grid_translate_anchor.extent_x, -grid_translate_delta.x / width)"
        },
        {
          "events": {"signal": "grid_zoom_delta"},
          "update": `zoomLinear(domain(\"${xScaleName}\"), grid_zoom_anchor.x, grid_zoom_delta)`
        },
        {"events": [{"source": "scope", "type": "dblclick"}], "update": "null"}
      ], [])
    },
    {
      "name": ifYElse(`grid_${yFieldName}_${yScaleName}`, "grid_y_field_undefined"),
      "on": ifYElse([
        {
          "events": {"signal": "grid_translate_delta"},
          "update": "panLinear(grid_translate_anchor.extent_y, grid_translate_delta.y / height)"
        },
        {
          "events": {"signal": "grid_zoom_delta"},
          "update": `zoomLinear(domain(\"${yScaleName}\"), grid_zoom_anchor.y, grid_zoom_delta)`
        },
        {"events": [{"source": "scope", "type": "dblclick"}], "update": "null"}
      ], [])
    },
    {
      "name": "grid_tuple",
      "on": [
        {
          "events": [{"signal": ifXElse(`grid_${xFieldName}_${xScaleName}`, "") + ifXY(" || ") + ifYElse(`grid_${yFieldName}_${yScaleName}`, "")}],
          "update": ifXElse(`grid_${xFieldName}_${xScaleName}`, "") + ifXY(" && ") + ifYElse(`grid_${yFieldName}_${yScaleName}`, "") + "? {unit: \"\", fields: tuple_fields, values: [" + ifXElse(`grid_${xFieldName}_${xScaleName}`, "") + ifXY(",") + ifYElse(`grid_${yFieldName}_${yScaleName}`, "") + "]} : null"
        }
      ]
    },
    {
      "name": "grid_translate_anchor",
      "value": {},
      "on": [
        {
          "events": [{"source": "scope", "type": "mousedown"}],
          "update": "{x: x(unit), y: y(unit)" + ifXElse(`, extent_x: domain(\"${xScaleName}\")`, "") + ifYElse(`, extent_y: domain(\"${yScaleName}\")`, "") + "}"
        },
      ]
    },
    {
      "name": "grid_translate_delta",
      "value": {},
      "on": [
        {
          "events": [
            {
              "source": "window",
              "type": "mousemove",
              "consume": true,
              "between": [
                {"source": "scope", "type": "mousedown"},
                {"source": "window", "type": "mouseup"}
              ]
            }
          ],
          "update": "{x: grid_translate_anchor.x - x(unit), y: grid_translate_anchor.y - y(unit)}"
        },
      ]
    },
    {
      "name": "grid_zoom_anchor",
      "on": [
        {
          "events": [{"source": "scope", "type": "wheel", "consume": true}],
          "update": "{" + ifXElse(`x: invert(\"${xScaleName}\", x(unit))`, "") + ifXY(", ") + ifYElse(`y: invert(\"${yScaleName}\", y(unit))`, "") + "}"
        }
      ]
    },
    {
      "name": "grid_zoom_delta",
      "on": [
        {
          "events": [{"source": "scope", "type": "wheel", "consume": true}],
          "force": true,
          "update": "pow(1.001, event.deltaY * pow(16, event.deltaMode))"
        }
      ]
    },
    {
      "name": "grid_modify",
      "update": `modify(\"grid_store_${groupName}\", grid_tuple, true)`
    },
    {"name": "points", "update": `vlSelectionResolve(\"points_store_${groupName}\")`},
    {
      "name": "points_tuple",
      "on": [
        {
          "events": [{"source": "scope", "type": "click"}],
          "update": "datum && !datum.manipulator && item().mark.marktype !== 'group' ? {unit: \"layer_0\", fields: points_tuple_fields, values: [(item().isVoronoi ? datum.datum : datum)[\"_vgsid_\"]]} : null",
          "force": true
        },
        {"events": [{"source": "scope", "type": "dblclick"}], "update": "null"}
      ]
    },
    {
      "name": "points_tuple_fields",
      "value": [{"type": "E", "field": "_vgsid_"}]
    },
    {
      "name": "points_toggle",
      "init": false
    },
    {
      "name": "points_modify",
      "update": `modify(\"points_store_${groupName}\", points_toggle ? null : points_tuple, points_toggle ? null : true, points_toggle ? points_tuple : null)`
    }
  ];
  return groupSpec;
}

function getScaleRecords(state: State, groupId: number): {scaleRecordX: ScaleRecord, scaleRecordY: ScaleRecord} {
  const ret = {
    scaleRecordX: null,
    scaleRecordY: null
  };
  const group: GroupRecord = state.getIn(['vis', 'present', 'marks', String(groupId)]);
  const childMarkIds: number[] = group.get('marks') as any as number[];// (vega-typings thinks these are vega objects but they're ids)
  const childMarks: MarkRecord[] = childMarkIds.map((id) => state.getIn(['vis', 'present', 'marks', String(id)]));
  if  (!childMarks.length) {
    return ret;
  }
  const mark = childMarks[0];
  if (mark.encode && mark.encode.update) {
    if (mark.encode.update.x) {
      const {scale, field} = mark.encode.update.x as any;
      ret.scaleRecordX = state.getIn(['vis', 'present', 'scales', String(scale)]);
    }
    if (mark.encode.update.y) {
      const {scale, field} = mark.encode.update.y as any;
      ret.scaleRecordY = state.getIn(['vis', 'present', 'scales', String(scale)]);
    }
  }
  return ret;
}

export function getScaleInfoForGroup(state: State, groupId: number): ScaleInfo {
  const {scaleRecordX, scaleRecordY} = getScaleRecords(state, groupId);
  return {
    xScaleName: scaleRecordX ? scaleRecordX.get('name') : null,
    xFieldName: scaleRecordX ? scaleRecordX.get('_domain')[0].field : null,
    xScaleType: scaleRecordX ? scaleTypeSimple(scaleRecordX.get('type')) : null,
    yScaleName: scaleRecordY ? scaleRecordY.get('name') : null,
    yFieldName: scaleRecordY ? scaleRecordY.get('_domain')[0].field : null,
    yScaleType: scaleRecordY ? scaleTypeSimple(scaleRecordY.get('type')) : null,
  };
}

export namespace ScaleSimpleType {
  export const CONTINUOUS = 'CONTINUOUS';
  export const DISCRETE = 'DISCRETE';
}
export type ScaleSimpleType = 'CONTINUOUS' | 'DISCRETE';

function scaleTypeSimple(scaleType): ScaleSimpleType {
  switch (scaleType) {
    case 'linear':
    case 'log':
    case 'pow':
    case 'sqrt':
    case 'symlog':
    case 'time':
    case 'utc':
    case 'sequential':
      return ScaleSimpleType.CONTINUOUS;
    case 'ordinal':
    case 'band':
    case 'point':
    case 'quantile':
    case 'quantize':
    case 'threshold':
    case 'bin-ordinal':
      return ScaleSimpleType.DISCRETE;
  }
}

export function cleanSpecForPreview(sceneSpec, groupName) {
  const sceneUpdated = duplicate(sceneSpec);
  sceneUpdated.marks = sceneUpdated.marks.filter(markSpec => {
    return markSpec.name && markSpec.type === 'group' ? markSpec.name === groupName : true; // remove top-level groups (views) other than the relevant one
  }).map(markSpec => {
    if (markSpec.name && markSpec.type === 'group') { // don't touch manipulators, which don't have names
      markSpec.axes = markSpec.axes.map((axis) => {
        return {...axis, title: '', labels: false};
      });
      markSpec.legends = [];
      markSpec.encode.update.x = {"value": 0};
      markSpec.encode.update.y = {"value": 0};
      markSpec.encode.update.width = {"signal": "width"};
      markSpec.encode.update.height = {"signal": "height"};

      if (markSpec.marks.length &&
        markSpec.marks[0].type === 'symbol' &&
        markSpec.marks[0].encode.update.size.value) {
        markSpec.marks[0].encode.update.size = {"value": "10"};
      }
    }
    return markSpec;
  });
  return sceneUpdated;
}

export function editSignalsForPreview(sceneSpec, groupName, signals) {
  const sceneUpdated = duplicate(sceneSpec);
  sceneUpdated.marks = sceneUpdated.marks.map(markSpec => {
    if (markSpec.name && markSpec.name === groupName && markSpec.type === 'group') {
      markSpec.signals = editSignals(markSpec.signals, signals.concat(baseSignals));
    }
    return markSpec;
  });
  return sceneUpdated;
}

export function editSignals(specSignals, interactionSignals) {
  return specSignals.map(signal => {
    const match = interactionSignals.filter(s => s.name === signal.name);
    return match.length ? match[0] : signal;
  }).concat(interactionSignals.filter(signal => {
    const match = specSignals.filter(s => s.name === signal.name);
    return match.length === 0;
  }));
}

const baseSignals = [
  {
    name: "width",
    init: "100"
  },
  {
    name: "height",
    init: "100"
  },
  {
    name: "brush_x",
    init: "[0, 0]"
  },
  {
    name: "brush_y",
    init: "[0, 0]"
  },
  {
    name: "brush_zoom_anchor",
    init: "null"
  },
  {
    name: "brush_zoom_delta",
    init: "null"
  },
  {
    name: "grid_zoom_anchor",
    init: "null"
  },
  {
    name: "grid_zoom_delta",
    init: "null"
  },
  {
    name: "points_tuple",
    init: "null"
  },
  {
    "name": "grid_translate_anchor",
    "init": {},
  },
  {
    "name": "grid_translate_delta",
    "init": {}
  },
];

export function selectionPreviewDefs(isDemonstratingInterval: boolean,
                                       isDemonstratingPoint: boolean,
                                       marks?: any[],
                                       scaleInfo?: ScaleInfo,
                                       projectionField?: string): LyraSelectionPreviewDef[] {
  let defs = [];
  const optionalParams = Boolean(marks && scaleInfo);
  projectionField = projectionField || '_vgsid_';
  if (isDemonstratingInterval) {
    const intervalDefs = {
      brush: {
        id: "brush",
        label: "Brush",
        signals: []
      },
      brush_y: {
        id: "brush_y",
        label: "Brush (y-axis)",
        signals: [
          {
            name: "lyra_brush_is_y_encoding",
            init: "true"
          }
        ]
      },
      brush_x: {
        id: "brush_x",
        label: "Brush (x-axis)",
        signals: [
          {
            name: "lyra_brush_is_x_encoding",
            init: "true"
          }
        ]
      }
    }
    if (!optionalParams) {
      defs = Object.values(intervalDefs);
    }
    else{
      const markTypes: Set<LyraMarkType> = new Set(marks.map((mark) => mark.type));
      if (markTypes.has('symbol')) {
        if (scaleInfo.xScaleType && scaleInfo.yScaleType) defs.push(intervalDefs.brush);
        if (scaleInfo.yScaleType) defs.push(intervalDefs.brush_y);
        if (scaleInfo.xScaleType) defs.push(intervalDefs.brush_x);
      }
      if (markTypes.has('rect')) {
        if (scaleInfo.xScaleType === ScaleSimpleType.DISCRETE) {
          defs.push(intervalDefs.brush_x);
        }
        if (scaleInfo.yScaleType === ScaleSimpleType.DISCRETE) {
          defs.push(intervalDefs.brush_y);
        }
      }
      if (markTypes.has('area')) {
        const areaMark = marks.filter(mark => mark.type === 'area')[0];
        if (areaMark.encode && areaMark.encode.update && areaMark.encode.update.orient && areaMark.encode.update.orient.value) {
          // TODO(jzong) what if orient is not in update but is in one of the other ones?
          if (areaMark.encode.update.orient.value === 'vertical' && scaleInfo.xScaleType) {
            defs.push(intervalDefs.brush_x);
          }
          else if (areaMark.encode.update.orient.value === 'horizontal' && scaleInfo.yScaleType) {
            defs.push(intervalDefs.brush_y);
          }
        }
      }
      if (markTypes.has('line')) {
        // TODO(jzong) ?
      }
      defs = [... new Set(defs)];
    }
  }
  if (isDemonstratingPoint) {
    defs = defs.concat([
      {
        id: "single",
        label: "Single point",
        projectionField,
        signals: []
      },
      {
        id: "multi",
        label: "Multi point",
        projectionField,
        signals: [
          {
            "name": "points_toggle",
            "value": false,
            "on": [
              {
                "events": [{"source": "scope", "type": "click"}],
                "update": "event.shiftKey"
              },
              {"events": [{"source": "scope", "type": "dblclick"}], "update": "false"}
            ]
          },
        ]
      },
    ]);
  }
  return defs;
}

export function signalsForProjection(projectionField: string) {
  return [
    {
      "name": "points_tuple",
      "on": [
        {
          "events": [{"source": "scope", "type": "click"}],
          "update": `datum && !datum.manipulator && item().mark.marktype !== 'group' ? {unit: \"layer_0\", fields: points_tuple_fields, values: [(item().isVoronoi ? datum.datum : datum)[\"${projectionField}\"]]} : null`,
          "force": true
        },
        {"events": [{"source": "scope", "type": "dblclick"}], "update": "null"}
      ]
    },
    {
      "name": "points_tuple_fields",
      "value": [{"type": "E", "field": projectionField}]
    },
  ]
}

export function editMarksForPreview(sceneSpec, groupName: string, preview: LyraMappingPreviewDef) {
  const sceneUpdated = duplicate(sceneSpec);
  sceneUpdated.marks = sceneUpdated.marks.map(markSpec => {
    if (markSpec.name && markSpec.name === groupName && markSpec.type === 'group') {
      if (preview.markProperties.encode && preview.markProperties.encode.update && preview.markProperties.encode.update.size) {
        // make symbol previews look nicer
        preview.markProperties.encode.update.size[1].value /= 5;
      }
      if (preview.id.indexOf('filter') >= 0) {
        return markSpec; // TODO don't leave this!!! this is bc i dont know what to do about previews for now
      }
      markSpec.marks = editMarks(markSpec.marks, preview);
      if (preview.id.indexOf('panzoom') === 0) {
        markSpec.marks = markSpec.marks.filter((mark) => mark.name.indexOf('lyra') !== 0);
      }
    }
    return markSpec;
  });
  return sceneUpdated;
}

export function editMarks(marks: any[], def: LyraMappingPreviewDef) {
  const markProperties = def.markProperties;
  const markType = def.markType;
  if (markProperties) {
    for (let mark of marks) {
      if (mark.type === 'group' || mark.name.indexOf('lyra') === 0) continue;
      if (!markType || mark.type === markType) { // TODO(jzong) i wouldn't be surprised if this condition is wrong when there's multiple marks
        for (let [key, value] of Object.entries(markProperties)) {
          if (key !== 'encode') {
            mark[key] = value;
          }
        }
        if (markProperties.encode && markProperties.encode.update) {
          for (let [key, value] of Object.entries(markProperties.encode.update)) {
            const oldValue = mark.encode.update[key];
            if (oldValue.value || oldValue.signal || oldValue.field) {
              delete value[0].value;
              value[0] = {...value[0], ...oldValue};
            }
            mark.encode.update[key] = value;
          }
        }
      }
    }
  }
  if (def.id.indexOf('panzoom') === 0) { // if panzoom, remove the brush marks
    marks = marks.filter(mark => !(mark.name && mark.name.indexOf('lyra') === 0));
  }
  return marks;
}

export function editScalesForPreview(sceneSpec, groupName: string, preview: LyraMappingPreviewDef) {
  const sceneUpdated = duplicate(sceneSpec);
  sceneUpdated.marks = sceneUpdated.marks.map(markSpec => {
    if (markSpec.name && markSpec.name === groupName && markSpec.type === 'group') {
      markSpec.scales = editScales(markSpec.scales, preview);
    }
    return markSpec;
  });
  return sceneUpdated;
}

export function editScales(scales: any[], def: LyraMappingPreviewDef) {
  if (!def.scaleProperties) {
    return scales;
  }

  for (let scale of scales) {
    for (let scaleProps of def.scaleProperties) {
      if (scale.name === scaleProps.name) {
        for (let [key, value] of Object.entries(scaleProps)) {
          if (key === '_axis') continue;
          scale[key] = value;
        }
      }
    }
  }
  return scales;
}


export function mappingPreviewDefs(isDemonstratingInterval: boolean, marks: any[], scaleInfo: ScaleInfo, groupName: string, sceneSpec): LyraMappingPreviewDef[] {
  let defs: LyraMappingPreviewDef[] = [{
    id: "color",
    label: "Color",
    groupName: groupName,
    markProperties: {
      "encode": {
        "update": {
          "fill": [
            {
              "test": isDemonstratingInterval ? `!(length(data(\"brush_store_${groupName}\"))) || (vlSelectionTest(\"brush_store_${groupName}\", datum))` :
                                                `!(length(data(\"points_store_${groupName}\"))) || (vlSelectionTest(\"points_store_${groupName}\", datum))`,
              "value": "orange"
            },
            {"value": "grey"}
          ],
        }
      }
    }
  },
  {
    id: "opacity",
    label: "Opacity",
    groupName: groupName,
    markProperties: {
      "encode": {
        "update": {
          "fillOpacity": [
            {
              "test": isDemonstratingInterval ? `!(length(data(\"brush_store_${groupName}\"))) || (vlSelectionTest(\"brush_store_${groupName}\", datum))` :
                                                `!(length(data(\"points_store_${groupName}\"))) || (vlSelectionTest(\"points_store_${groupName}\", datum))`,
              "value": "1"
            },
            {"value": "0.2"}
          ],
        }
      }
    }
  }];

  const markTypes: Set<LyraMarkType> = new Set(marks.map((mark) => mark.type));
  if (markTypes.has('symbol')) {
    defs = defs.concat([
      {
        id: "size",
        label: "Size",
        groupName: groupName,
        markType: "symbol",
        markProperties: {
          "encode": {
            "update": {
              "size": [
                {
                  "test": isDemonstratingInterval ? `!(length(data(\"brush_store_${groupName}\"))) || (vlSelectionTest(\"brush_store_${groupName}\", datum))` :
                                                    `!(length(data(\"points_store_${groupName}\"))) || (vlSelectionTest(\"points_store_${groupName}\", datum))`,
                  "value": isDemonstratingInterval ? "10" : "20"
                },
                {"value": isDemonstratingInterval ? "5" : "10"}
              ],
            }
          }
        }
      },
    ]);
  }
  if (isDemonstratingInterval) {
    const panzoomDef: LyraMappingPreviewDef = {
      id: "panzoom",
      label: "Pan and zoom",
      groupName: groupName,
      markProperties: {
        "clip": {"value": true}
      },
      scaleProperties: [
        {
          "_axis": "x",
          "name": scaleInfo.xScaleName,
          "domainRaw": {"signal": `grid["${scaleInfo.xFieldName}"]`},
          "zero": false
        },
        {
          "_axis": "y",
          "name": scaleInfo.yScaleName,
          "domainRaw": {"signal": `grid["${scaleInfo.yFieldName}"]`},
          "zero": false
        }
      ]
    }
    defs.push(panzoomDef);
  }
  const filterViewDefs = filterViewMappingPreviewDefs(isDemonstratingInterval, sceneSpec, groupName);
  defs = defs.concat(filterViewDefs);
  return defs;
}

function filterViewMappingPreviewDefs(isDemonstratingInterval: boolean, sceneSpec, groupName: string): LyraMappingPreviewDef[] {
  const otherGroups = sceneSpec.marks.filter(markSpec => {
    return markSpec.name && markSpec.type === 'group' && markSpec.name !== groupName;
  });
  return otherGroups.map(groupSpec => {
      if (groupSpec.marks.length) {
        const maybeDataset = groupSpec.marks.filter(markSpec => markSpec.from && markSpec.from.data).map(markSpec => markSpec.from.data);
        console.log(maybeDataset)
        if (maybeDataset.length) {
          const newDatasetName = maybeDataset[0] + "_filter_" + groupSpec.name;
          return {
            id: "filter_" + groupSpec.name,
            label: "Filter " + groupSpec.name,
            groupName: groupSpec.name,
            markProperties: {
              "from": {
                "data": newDatasetName
              }
            },
            datasetProperties: {
              "name": newDatasetName,
              "source": maybeDataset[0],
              "transform": [{
                "type": "filter",
                "expr": isDemonstratingInterval ? `!(length(data(\"brush_store_${groupName}\"))) || (vlSelectionTest(\"brush_store_${groupName}\", datum))` :
                `!(length(data(\"points_store_${groupName}\"))) || (vlSelectionTest(\"points_store_${groupName}\", datum))`,
              }]
            }
          }
        }
      }
      return null;
  }).filter(x => x);
}
