import {GroupMark, Spec} from "vega";
import {ScaleRecord} from "../store/factory/Scale";
import {State} from "../store";
import duplicate from "../util/duplicate";
import {MarkRecord} from "../store/factory/Mark";
import {GroupRecord} from "../store/factory/marks/Group";
import {ScaleInfo, ApplicationRecord, SelectionRecord, PointSelectionRecord, MarkApplicationRecord, ScaleApplicationRecord, TransformApplicationRecord, IntervalSelectionRecord, InteractionInput} from "../store/factory/Interaction";

export function addDatasetsToScene(sceneSpec: Spec, groupName: string, interactionId: number): Spec {
  const sceneUpdated = duplicate(sceneSpec);
  const data = sceneUpdated.data || (sceneUpdated.data = []);
  sceneUpdated.data = [...data,
    {"name": `brush_store_${groupName}_${interactionId}`},
    {"name": `grid_store_${groupName}_${interactionId}`},
    {"name": `points_store_${groupName}_${interactionId}`},
  ];
  return sceneUpdated;
}

export function addInputsToScene(sceneSpec: Spec, groupName: string, interactionId: number, input: InteractionInput, scaleInfo: ScaleInfo, exclusive?: boolean): Spec {
  // if (!input) return sceneSpec;
  const {xScaleName, yScaleName, xFieldName, yFieldName} = scaleInfo;
  const {ifXElse, ifYElse, ifXY} = conditionalHelpersForScales(scaleInfo);

  // const isDemonstratingInterval = input.mouse === 'drag';

  sceneSpec = applySignals(sceneSpec, groupName, [
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
      "name": `key_modifier_${interactionId}`,
      "value": input && input.keycode ? false : true,
      "on": [
        {
          "events": [{"source": "window", "type": "keydown"}],
          "update": input && input.keycode ? `event.keyCode === ${input.keycode}` : (exclusive ? "false" : "true")
        },
        {
          "events": [{"source": "window", "type": "keyup"}],
          "update": input && input.keycode ? "false" : "true"
        }
      ]
    },
    {
      "name": `mouse_x_${interactionId}`,
      "on": [
        {
          "events": "mousemove",
          "update": `key_modifier_${interactionId} ? x(unit) : mouse_x_${interactionId}`
        }
      ]
    },
    {
      "name": `mouse_y_${interactionId}`,
      "on": [
        {
          "events": "mousemove",
          "update": `key_modifier_${interactionId} ? y(unit) : mouse_y_${interactionId}`
        }
      ]
    },
  ]);

  // if (!isDemonstratingInterval) {
    // Point
    sceneSpec = applySignals(sceneSpec, groupName, [
      {"name": `points_${interactionId}`, "update": `vlSelectionResolve(\"points_store_${groupName}_${interactionId}\")`},
      {
        "name": `points_tuple_${interactionId}`,
        "on": [
          {
            "events": [{"source": "scope", "type": input ? input.mouse : "click"}],
            "update": `datum && !datum.manipulator && item().mark.marktype !== 'group' ? (key_modifier_${interactionId} ? {unit: \"layer_0\", fields: points_tuple_fields_${interactionId}, values: [(item().isVoronoi ? datum.datum : datum)['_vgsid_']]} : points_tuple_${interactionId} ) : null`,
            "force": true
          },
          {"events": [{"source": "scope", "type": "dblclick"}], "update": "null"}
        ]
      },
      {
        "name": `points_tuple_fields_${interactionId}`,
        "value": [{"type": "E", "field": '_vgsid_'}]
      },
      {
        "name": `points_modify_${interactionId}`,
        "update": `modify(\"points_store_${groupName}_${interactionId}\", points_tuple_${interactionId}, true, null)`
      }
    ]);
  // }
  // else {
    // Interval
    sceneSpec = addBrushMark(sceneSpec, groupName, interactionId, scaleInfo);
    sceneSpec = applySignals(sceneSpec, groupName, [
      {
        "name": `brush_x_start_${interactionId}`,
        "update": `lyra_brush_x_${interactionId}[0]`
      },
      {
        "name": `brush_x_end_${interactionId}`,
        "update": `lyra_brush_x_${interactionId}[1]`
      },
      {
        "name": `brush_y_start_${interactionId}`,
        "update": `lyra_brush_y_${interactionId}[0]`
      },
      {
        "name": `brush_y_end_${interactionId}`,
        "update": `lyra_brush_y_${interactionId}[1]`
      },
      {
        "name": `lyra_brush_is_x_encoding_${interactionId}`,
        "init": "false"
      },
      {
        "name": `lyra_brush_is_y_encoding_${interactionId}`,
        "init": "false"
      },
      {
        "name": `lyra_brush_x_${interactionId}`,
        "update": `lyra_brush_is_y_encoding_${interactionId} ? [width, 0] : brush_x_${interactionId}`
      },
      {
        "name": `lyra_brush_y_${interactionId}`,
        "update": `lyra_brush_is_x_encoding_${interactionId} ? [0, height] : brush_y_${interactionId}`
      },
      {"name": `brush_${interactionId}`, "update": `vlSelectionResolve(\"brush_store_${groupName}_${interactionId}\")`},
      {"name": `grid_${interactionId}`, "update": `vlSelectionResolve(\"grid_store_${groupName}_${interactionId}\")`},
      {
        "name": `brush_x_${interactionId}`,
        "value": [],
        "on": [
          {
            "events": {
              "source": "scope",
              "type": "mousedown",
              "filter": [
                `!event.item || event.item.mark.name !== \"lyra_brush_brush_${interactionId}\"`
              ]
            },
            "update": `key_modifier_${interactionId} ? [x(unit), x(unit)] : brush_x_${interactionId}`
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
                    `!event.item || event.item.mark.name !== \"lyra_brush_brush_${interactionId}\"`
                  ]
                },
                {
                  "source": "window",
                  "type": "mouseup"
                }
              ]
            },
            "update": `key_modifier_${interactionId} ? [brush_x_${interactionId}[0], clamp(x(unit), 0, width)] : brush_x_${interactionId}`
          },
          {
            "events": {
              "signal": `brush_scale_trigger_${interactionId}`
            },
            "update": ifXElse(`isArray(brush_${xFieldName}_${xScaleName}_${interactionId}) && length(brush_${xFieldName}_${xScaleName}_${interactionId}) == 2 ? [scale(\"${xScaleName}\", brush_${xFieldName}_${xScaleName}_${interactionId}[0]), scale(\"${xScaleName}\", brush_${xFieldName}_${xScaleName}_${interactionId}[1])] : [0, 0]`, "[width, 0]")
          },
          {
            "events": {
              "signal": `brush_translate_delta_${interactionId}`
            },
            "update": `clampRange(panLinear(brush_translate_anchor_${interactionId}.extent_x, brush_translate_delta_${interactionId}.x / span(brush_translate_anchor_${interactionId}.extent_x)), 0, width)`
          },
          {
            "events": {
              "signal": `brush_zoom_delta_${interactionId}`
            },
            "update": `clampRange(zoomLinear(brush_x_${interactionId}, brush_zoom_anchor_${interactionId}.x, brush_zoom_delta_${interactionId}), 0, width)`
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
        "name": ifXElse(`brush_${xFieldName}_${xScaleName}_${interactionId}`, `brush_x_field_undefined_${interactionId}`),
        "on": ifXElse([
          {
            "events": {
              "signal": `lyra_brush_x_${interactionId}`
            },
            "update": `lyra_brush_x_${interactionId}[0] === lyra_brush_x_${interactionId}[1] ? null : invert(\"${xScaleName}\", lyra_brush_x_${interactionId})`
          }
        ], [])
      },
      {
        "name": `brush_y_${interactionId}`,
        "value": [],
        "on": [
          {
            "events": {
              "source": "scope",
              "type": "mousedown",
              "filter": [
                `!event.item || event.item.mark.name !== \"lyra_brush_brush_${interactionId}\"`
              ]
            },
            "update": `key_modifier_${interactionId} ? [y(unit), y(unit)] : brush_y_${interactionId}`
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
                    `!event.item || event.item.mark.name !== \"lyra_brush_brush_${interactionId}\"`
                  ]
                },
                {
                  "source": "window",
                  "type": "mouseup"
                }
              ]
            },
            "update": `key_modifier_${interactionId} ? [brush_y_${interactionId}[0], clamp(y(unit), 0, height)] : brush_y_${interactionId}`
          },
          {
            "events": {
              "signal": `brush_scale_trigger_${interactionId}`
            },
            "update": ifYElse(`isArray(brush_${yFieldName}_${yScaleName}_${interactionId}) && length(brush_${yFieldName}_${yScaleName}_${interactionId}) == 2 ? [scale(\"${yScaleName}\", brush_${yFieldName}_${yScaleName}_${interactionId}[0]), scale(\"${yScaleName}\", brush_${yFieldName}_${yScaleName}_${interactionId}[1])] : [0, 0]`, "[0, height]")
          },
          {
            "events": {
              "signal": `brush_translate_delta_${interactionId}`
            },
            "update": `clampRange(panLinear(brush_translate_anchor_${interactionId}.extent_y, brush_translate_delta_${interactionId}.y / span(brush_translate_anchor_${interactionId}.extent_y)), 0, height)`
          },
          {
            "events": {
              "signal": `brush_zoom_delta_${interactionId}`
            },
            "update": `clampRange(zoomLinear(brush_y_${interactionId}, brush_zoom_anchor_${interactionId}.y, brush_zoom_delta_${interactionId}), 0, height)`
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
        "name": ifYElse(`brush_${yFieldName}_${yScaleName}_${interactionId}`, `brush_y_field_undefined_${interactionId}`),
        "on": ifYElse([
          {
            "events": {
              "signal": `lyra_brush_y_${interactionId}`
            },
            "update": `lyra_brush_y_${interactionId}[0] === lyra_brush_y_${interactionId}[1] ? null : invert(\"${yScaleName}\", lyra_brush_y_${interactionId})`
          }
        ], [])
      },
      {
        "name": `brush_scale_trigger_${interactionId}`,
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
              ifXElse(`(!isArray(brush_${xFieldName}_${xScaleName}_${interactionId}) || (+invert(\"${xScaleName}\", lyra_brush_x_${interactionId})[0] === +brush_${xFieldName}_${xScaleName}_${interactionId}[0] && +invert(\"${xScaleName}\", lyra_brush_x_${interactionId})[1] === +brush_${xFieldName}_${xScaleName}_${interactionId}[1]))`, '') +
              ifXY(" && ") +
              ifYElse(`(!isArray(brush_${yFieldName}_${yScaleName}_${interactionId}) || (+invert(\"${yScaleName}\", lyra_brush_y_${interactionId})[0] === +brush_${yFieldName}_${yScaleName}_${interactionId}[0] && +invert(\"${yScaleName}\", lyra_brush_y_${interactionId})[1] === +brush_${yFieldName}_${yScaleName}_${interactionId}[1]))`, '') +
              ` ? brush_scale_trigger_${interactionId} : {}`
          }
        ]
      },
      {
        "name": `brush_tuple_${interactionId}`,
        "on": [
          {
            "events": [
              {
                "signal": ifXElse(`brush_${xFieldName}_${xScaleName}_${interactionId}`, "") + ifXY(" || ") + ifYElse(`brush_${yFieldName}_${yScaleName}_${interactionId}`, "")
              }
            ],
            "update": ifXElse(`brush_${xFieldName}_${xScaleName}_${interactionId}`, "") + ifXY(" && ") + ifYElse(`brush_${yFieldName}_${yScaleName}_${interactionId}`, "") + ` ? {unit: \"\", fields: brush_tuple_fields_${interactionId}, values: [` +
                          ifXElse(`brush_${xFieldName}_${xScaleName}_${interactionId}`, "") + ifXY(",") + ifYElse(`brush_${yFieldName}_${yScaleName}_${interactionId}`, "") + "]} : null"
          }
        ]
      },
      {
        "name": `brush_tuple_fields_${interactionId}`,
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
        "name": `brush_translate_anchor_${interactionId}`,
        "value": {},
        "on": [
          {
            "events": [
              {
                "source": "scope",
                "type": "mousedown",
                "markname": `lyra_brush_brush_${interactionId}`
              }
            ],
            "update": `key_modifier_${interactionId} ? {x: x(unit), y: y(unit), extent_x: slice(lyra_brush_x_${interactionId}), extent_y: slice(lyra_brush_y_${interactionId})} : brush_translate_anchor_${interactionId}`
          }
        ]
      },
      {
        "name": `brush_translate_delta_${interactionId}`,
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
                    "markname": `lyra_brush_brush_${interactionId}`
                  },
                  {
                    "source": "window",
                    "type": "mouseup"
                  }
                ]
              }
            ],
            "update": `key_modifier_${interactionId} ? {x: brush_translate_anchor_${interactionId}.x - x(unit), y: brush_translate_anchor_${interactionId}.y - y(unit)} : brush_translate_delta_${interactionId}`
          }
        ]
      },
      {
        "name": `brush_zoom_anchor_${interactionId}`,
        "on": [
          {
            "events": [
              {
                "source": "scope",
                "type": "wheel",
                "consume": true,
                "markname": `lyra_brush_brush_${interactionId}`
              }
            ],
            "update": `key_modifier_${interactionId} ? {x: x(unit), y: y(unit)} : brush_zoom_anchor_${interactionId}`
          }
        ]
      },
      {
        "name": `brush_zoom_delta_${interactionId}`,
        "on": [
          {
            "events": [
              {
                "source": "scope",
                "type": "wheel",
                "consume": true,
                "markname": `lyra_brush_brush_${interactionId}`
              }
            ],
            "force": true,
            "update": `key_modifier_${interactionId} ? pow(1.001, event.deltaY * pow(16, event.deltaMode)) : brush_zoom_delta_${interactionId}`
          }
        ]
      },
      {
        "name": `brush_modify_${interactionId}`,
        "update": `modify(\"brush_store_${groupName}_${interactionId}\", brush_tuple_${interactionId}, true)`
      },

      {
        "name": ifXElse(`grid_${xFieldName}_${xScaleName}_${interactionId}`, `grid_x_field_undefined_${interactionId}`),
        "on": ifXElse([
          {
            "events": {"signal": `grid_translate_delta_${interactionId}`},
            "update": `panLinear(grid_translate_anchor_${interactionId}.extent_x, -grid_translate_delta_${interactionId}.x / width)`
          },
          {
            "events": {"signal": `grid_zoom_delta_${interactionId}`},
            "update": `zoomLinear(domain(\"${xScaleName}\"), grid_zoom_anchor_${interactionId}.x, grid_zoom_delta_${interactionId})`
          },
          {"events": [{"source": "scope", "type": "dblclick"}], "update": "null"}
        ], [])
      },
      {
        "name": ifYElse(`grid_${yFieldName}_${yScaleName}_${interactionId}`, `grid_y_field_undefined_${interactionId}`),
        "on": ifYElse([
          {
            "events": {"signal": `grid_translate_delta_${interactionId}`},
            "update": `panLinear(grid_translate_anchor_${interactionId}.extent_y, grid_translate_delta_${interactionId}.y / height)`
          },
          {
            "events": {"signal": `grid_zoom_delta_${interactionId}`},
            "update": `zoomLinear(domain(\"${yScaleName}\"), grid_zoom_anchor_${interactionId}.y, grid_zoom_delta_${interactionId})`
          },
          {"events": [{"source": "scope", "type": "dblclick"}], "update": "null"}
        ], [])
      },
      {
        "name": `grid_tuple_${interactionId}`,
        "on": [
          {
            "events": [{"signal": ifXElse(`grid_${xFieldName}_${xScaleName}_${interactionId}`, "") + ifXY(" || ") + ifYElse(`grid_${yFieldName}_${yScaleName}_${interactionId}`, "")}],
            "update": ifXElse(`grid_${xFieldName}_${xScaleName}_${interactionId}`, "") + ifXY(" && ") + ifYElse(`grid_${yFieldName}_${yScaleName}_${interactionId}`, "") + `? {unit: \"\", fields: brush_tuple_fields_${interactionId}, values: [` + ifXElse(`grid_${xFieldName}_${xScaleName}_${interactionId}`, "") + ifXY(",") + ifYElse(`grid_${yFieldName}_${yScaleName}_${interactionId}`, "") + "]} : null"
          }
        ]
      },
      {
        "name": `grid_translate_anchor_${interactionId}`,
        "value": {},
        "on": [
          {
            "events": [{"source": "scope", "type": "mousedown"}],
            "update": `key_modifier_${interactionId} ? {x: x(unit), y: y(unit)` + ifXElse(`, extent_x: domain(\"${xScaleName}\")`, "") + ifYElse(`, extent_y: domain(\"${yScaleName}\")`, "") + `} : grid_translate_anchor_${interactionId}`
          },
        ]
      },
      {
        "name": `grid_translate_delta_${interactionId}`,
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
            "update": `key_modifier_${interactionId} ? {x: grid_translate_anchor_${interactionId}.x - x(unit), y: grid_translate_anchor_${interactionId}.y - y(unit)} : grid_translate_delta_${interactionId}`
          },
        ]
      },
      {
        "name": `grid_zoom_anchor_${interactionId}`,
        "on": [
          {
            "events": [{"source": "scope", "type": "wheel", "consume": true}],
            "update": `key_modifier_${interactionId} ? {` + ifXElse(`x: invert(\"${xScaleName}\", x(unit))`, "") + ifXY(", ") + ifYElse(`y: invert(\"${yScaleName}\", y(unit))`, "") + `} : grid_zoom_anchor_${interactionId}`
          }
        ]
      },
      {
        "name": `grid_zoom_delta_${interactionId}`,
        "on": [
          {
            "events": [{"source": "scope", "type": "wheel", "consume": true}],
            "force": true,
            "update": `key_modifier_${interactionId} ? pow(1.001, event.deltaY * pow(16, event.deltaMode)) : grid_zoom_delta_${interactionId}`
          }
        ]
      },
      {
        "name": `grid_modify_${interactionId}`,
        "update": `modify(\"grid_store_${groupName}_${interactionId}\", grid_tuple_${interactionId}, true)`
      },
    ]);
  // }
  return sceneSpec;
}



export function addSelectionToScene(sceneSpec: Spec, groupName: string, interactionId: number, input: InteractionInput, selection: SelectionRecord): Spec {
  switch (selection.type) {
    case 'point':
        selection = selection as PointSelectionRecord;
        const field = selection.field;
        switch (selection.ptype) {
          case 'single':
            return applySignals(sceneSpec, groupName, [
                {
                  "name": `points_tuple_${interactionId}`,
                  "on": [
                    {
                      "events": [{"source": "scope", "type": input ? input.mouse : "click"}],
                      "update": `datum && !datum.manipulator && item().mark.marktype !== 'group' ? (key_modifier_${interactionId} ? {unit: \"layer_0\", fields: points_tuple_fields_${interactionId}, values: [(item().isVoronoi ? datum.datum : datum)['${field ? field : '_vgsid_'}']]} : points_tuple_${interactionId} ) : null`,
                      "force": true
                    },
                    {"events": [{"source": "scope", "type": "dblclick"}], "update": "null"}
                  ]
                },
                {
                  "name": `points_tuple_fields_${interactionId}`,
                  "value": [{"type": "E", "field": field ? field : '_vgsid_'}]
                },
              ]);
          case 'multi':
            return applySignals(sceneSpec, groupName, [
              {
                "name": `points_tuple_${interactionId}`,
                "on": [
                  {
                    "events": [{"source": "scope", "type": input ? input.mouse : "click"}],
                    "update": `datum && !datum.manipulator && item().mark.marktype !== 'group' ? (key_modifier_${interactionId} ? {unit: \"layer_0\", fields: points_tuple_fields_${interactionId}, values: [(item().isVoronoi ? datum.datum : datum)['${field ? field : '_vgsid_'}']]} : points_tuple_${interactionId} ) : null`,
                    "force": true
                  },
                  {"events": [{"source": "scope", "type": "dblclick"}], "update": "null"}
                ]
              },
              {
                "name": `points_tuple_fields_${interactionId}`,
                "value": [{"type": "E", "field": field ? field : '_vgsid_'}]
              },
              {
                "name": `points_toggle_${interactionId}`,
                "value": false, // TODO(jzong) i disagree with this default behavior in vega
                "on": [
                  {
                    "events": [{"source": "scope", "type": input ? input.mouse : "click"}],
                    "update": "event.shiftKey" // TODO(jzong) incorporate this into the event key customization logic
                  },
                  {"events": [{"source": "scope", "type": "dblclick"}], "update": "false"}
                ]
              }
            ]);
        }
      break;
    case 'interval':
        selection = selection as IntervalSelectionRecord;
        switch (selection.field) {
          case 'x':
            return applySignals(sceneSpec, groupName, [
              {
                "name": `lyra_brush_is_x_encoding_${interactionId}`,
                "init": "true"
              },
              {
                "name": `lyra_brush_is_y_encoding_${interactionId}`,
                "init": "false"
              }
            ]);
          case 'y':
            return applySignals(sceneSpec, groupName, [
              {
                "name": `lyra_brush_is_y_encoding_${interactionId}`,
                "init": "true"
              },
              {
                "name": `lyra_brush_is_x_encoding_${interactionId}`,
                "init": "false"
              }
            ]);
          default:
            return sceneSpec;
        }
  }
}

export function addApplicationToScene(sceneSpec: Spec, groupName: string, interactionId: number, input: InteractionInput, application: ApplicationRecord): Spec {
  const isDemonstratingInterval = input.mouse === 'drag';
  let targetMarkName;
  switch (application.type) {
    case 'mark':
      application = application as MarkApplicationRecord;
      targetMarkName = application.targetMarkName;
      const defaultValue = application.defaultValue;
      return applyMarkProperties(sceneSpec, groupName, targetMarkName, {
        "encode": {
          "update": {
            [application.propertyName]: [
              {
                "test": isDemonstratingInterval ? `!(length(data(\"brush_store_${groupName}_${interactionId}\"))) || (vlSelectionTest(\"brush_store_${groupName}_${interactionId}\", datum))` :
                                                  `!(length(data(\"points_store_${groupName}_${interactionId}\"))) || (vlSelectionTest(\"points_store_${groupName}_${interactionId}\", datum))`,
                "value": "" // we expect this to be overwritten with the mark's value
              },
              {"value": defaultValue}
            ],
          }
        }
      });
    case 'scale':
      application = application as ScaleApplicationRecord;
      const scaleInfo = application.scaleInfo;
      sceneSpec = removeBrushMark(sceneSpec, groupName);
      sceneSpec = clipGroup(sceneSpec, groupName);
      return applyScaleProperties(sceneSpec, groupName, [
        {
          "_axis": "x",
          "name": scaleInfo.xScaleName,
          "domainRaw": {"signal": `grid_${interactionId}["${scaleInfo.xFieldName}"]`},
          "zero": false
        },
        {
          "_axis": "y",
          "name": scaleInfo.yScaleName,
          "domainRaw": {"signal": `grid_${interactionId}["${scaleInfo.yFieldName}"]`},
          "zero": false
        }
      ]);
    case 'transform':
      application = application as TransformApplicationRecord;
      const datasetName = application.datasetName;
      const targetGroupName = application.targetGroupName;
      targetMarkName = application.targetMarkName;

      const newDatasetName = datasetName + "_filter_" + targetGroupName;

      sceneSpec = applyMarkProperties(sceneSpec, targetGroupName, targetMarkName, {
        "from": {
          "data": newDatasetName
        }
      });

      const {source, transform} = collectTransforms(sceneSpec, datasetName, []);
      sceneSpec = applyDatasetProperties(sceneSpec, {
        "name": newDatasetName,
        "source": source,
        "transform": [{
          "type": "filter",
          "expr": isDemonstratingInterval ? `!(length(data(\"brush_store_${groupName}_${interactionId}\"))) || (vlSelectionTest(\"brush_store_${groupName}_${interactionId}\", datum))` :
          `!(length(data(\"points_store_${groupName}_${interactionId}\"))) || (vlSelectionTest(\"points_store_${groupName}_${interactionId}\", datum))`,
        }, ...transform]
      });

      return sceneSpec;
  }
}

function applySignals(sceneSpec, groupName: string, signals: any[]): Spec {
  const sceneUpdated = duplicate(sceneSpec);
  sceneUpdated.marks = sceneUpdated.marks.map(markSpec => {
    if (markSpec.name && markSpec.name === groupName && markSpec.type === 'group') {
      markSpec.signals = editSignals(markSpec.signals, signals);
    }
    return markSpec;
  });
  return sceneUpdated;
}

function applyMarkProperties(sceneSpec, groupName: string, markName: string, markProperties: any): Spec {
  sceneSpec = duplicate(sceneSpec);
  sceneSpec.marks = sceneSpec.marks.map(markSpec => {
    if (markSpec.name && markSpec.name === groupName && markSpec.type === 'group') {
      markSpec.marks = markSpec.marks.map(mark => {
        if (mark.type === 'group' || mark.name.indexOf('lyra') === 0) return mark;
        if (mark.name === markName) {
          for (let [key, value] of Object.entries(markProperties)) {
            if (key !== 'encode') {
              mark[key] = value;
            }
          }
          if (markProperties.encode && markProperties.encode.update) {
            for (let [key, value] of Object.entries(markProperties.encode.update)) {
              const oldValue = mark.encode.update[key];
              if (oldValue) {
                if (oldValue.value || oldValue.signal || oldValue.field) {
                  delete value[0].value;
                  value[0] = {...value[0], ...oldValue};
                } else if (Array.isArray(oldValue) && oldValue[0].test && !value[0].test.includes(oldValue[0].test)) {
                  value[0].test = value[0].test + ' && ' + oldValue[0].test;
                  value[0].value = oldValue[0].value;
                }
              }
              mark.encode.update[key] = value;
            }
          }
        }
        return mark;
      });
    }
    return markSpec;
  });
  return sceneSpec;
}

function removeBrushMark(sceneSpec, groupName: string): Spec {
  sceneSpec = duplicate(sceneSpec);
  sceneSpec.marks = sceneSpec.marks.map(markSpec => {
    if (markSpec.name && markSpec.name === groupName && markSpec.type === 'group') {
      markSpec.marks = markSpec.marks.filter(mark => !(mark.name && mark.name.indexOf('lyra') === 0));
    }
    return markSpec;
  });
  return sceneSpec;
}

function clipGroup(sceneSpec, groupName: string): Spec {
  sceneSpec = duplicate(sceneSpec);
  sceneSpec.marks = sceneSpec.marks.map(markSpec => {
    if (markSpec.name && markSpec.name === groupName && markSpec.type === 'group') {
      markSpec.clip = {"value": true};
    }
    return markSpec;
  });
  return sceneSpec;
}

function applyScaleProperties(sceneSpec, groupName: string, scaleProperties: any): Spec {
  sceneSpec = duplicate(sceneSpec);
  sceneSpec.marks = sceneSpec.marks.map(markSpec => {
    if (markSpec.name && markSpec.name === groupName && markSpec.type === 'group') {
      markSpec.scales.forEach(scale => {
        scaleProperties.forEach(scaleProps => {
          if (scale.name === scaleProps.name) {
            for (let [key, value] of Object.entries(scaleProps)) {
              if (key === '_axis') continue;
              scale[key] = value;
            }
          }
        });
      });
    }
    return markSpec;
  });
  return sceneSpec;
}

function collectTransforms(sceneSpec, datasetName: string, transforms: any[]): {source: string, transform: any[]} {
  const dataset = sceneSpec.data.filter(data => data.name === datasetName)[0];
  const currentTransforms = transforms.concat(dataset.transform);
  const currentTransformsToString = currentTransforms.map(x => JSON.stringify(x));
  const uniqueTransforms = currentTransforms.filter((transform, idx) => {
    return currentTransformsToString.indexOf(JSON.stringify(transform)) === idx;
  });
  if (dataset.source) {
    return collectTransforms(sceneSpec, dataset.source, uniqueTransforms);
  }
  return {source: datasetName, transform: uniqueTransforms};
}

function applyDatasetProperties(sceneSpec, datasetProperties): Spec {
  sceneSpec = duplicate(sceneSpec);
  const data = sceneSpec.data || (sceneSpec.data = []);
  const deduplicated = data.filter(d => d.name !== datasetProperties.name);
  sceneSpec.data = [...deduplicated, datasetProperties];
  return sceneSpec;
}

function conditionalHelpersForScales(scaleInfo: ScaleInfo) {
  const {xScaleName, yScaleName, xFieldName, yFieldName} = scaleInfo;
  return {
    ifXElse: (e1, e2) => xScaleName && xFieldName ? e1 : e2,
    ifYElse: (e1, e2) => yScaleName && yFieldName ? e1 : e2,
    ifXY: (e1) => xScaleName && xFieldName && yScaleName && yFieldName ? e1 : ''
  }
}

function addBrushMark(sceneSpec, groupName: string, interactionId: number, scaleInfo: ScaleInfo): Spec {
  const {ifXElse, ifYElse, ifXY} = conditionalHelpersForScales(scaleInfo);
  sceneSpec = duplicate(sceneSpec);
  sceneSpec.marks = sceneSpec.marks.map(markSpec => {
    if (markSpec.name && markSpec.name === groupName && markSpec.type === 'group') {
      markSpec.marks = [
        ...markSpec.marks,
        {
          "name": `lyra_brush_brush_bg_${interactionId}`,
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
                  "test": `data(\"brush_store_${groupName}_${interactionId}\").length && data(\"brush_store_${groupName}_${interactionId}\")[0].unit === \"\"`,
                }, ifXElse({"signal": `lyra_brush_x_${interactionId}[0]`}, {"value": "0"})),
                {
                  "value": 0
                }
              ],
              "y": [
                Object.assign({
                  "test": `data(\"brush_store_${groupName}_${interactionId}\").length && data(\"brush_store_${groupName}_${interactionId}\")[0].unit === \"\"`,
                }, ifYElse({"signal": `lyra_brush_y_${interactionId}[0]`}, {"value": "0"})),
                {
                  "value": 0
                }
              ],
              "x2": [
                Object.assign({
                  "test": `data(\"brush_store_${groupName}_${interactionId}\").length && data(\"brush_store_${groupName}_${interactionId}\")[0].unit === \"\"`,
                }, ifXElse({"signal": `lyra_brush_x_${interactionId}[1]`}, {"signal": "width"})),
                {
                  "value": 0
                }
              ],
              "y2": [
                Object.assign({
                  "test": `data(\"brush_store_${groupName}_${interactionId}\").length && data(\"brush_store_${groupName}_${interactionId}\")[0].unit === \"\"`,
                }, ifYElse({"signal": `lyra_brush_y_${interactionId}[1]`}, {"signal": "height"})),
                {
                  "value": 0
                }
              ]
            }
          }
        },
        {
          "name": `lyra_brush_brush_${interactionId}`,
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
                  "test": `data(\"brush_store_${groupName}_${interactionId}\").length && data(\"brush_store_${groupName}_${interactionId}\")[0].unit === \"\"`,
                }, ifXElse({"signal": `lyra_brush_x_${interactionId}[0]`}, {"value": "0"})),
                {
                  "value": 0
                }
              ],
              "y": [
                Object.assign({
                  "test": `data(\"brush_store_${groupName}_${interactionId}\").length && data(\"brush_store_${groupName}_${interactionId}\")[0].unit === \"\"`,
                }, ifYElse({"signal": `lyra_brush_y_${interactionId}[0]`}, {"value": "0"})),
                {
                  "value": 0
                }
              ],
              "x2": [
                Object.assign({
                  "test": `data(\"brush_store_${groupName}_${interactionId}\").length && data(\"brush_store_${groupName}_${interactionId}\")[0].unit === \"\"`,
                }, ifXElse({"signal": `lyra_brush_x_${interactionId}[1]`}, {"signal": "width"})),
                {
                  "value": 0
                }
              ],
              "y2": [
                Object.assign({
                  "test": `data(\"brush_store_${groupName}_${interactionId}\").length && data(\"brush_store_${groupName}_${interactionId}\")[0].unit === \"\"`,
                }, ifYElse({"signal": `lyra_brush_y_${interactionId}[1]`}, {"signal": "height"})),
                {
                  "value": 0
                }
              ],
              "stroke": [
                {
                  "test": ifXElse(`lyra_brush_x_${interactionId}[0] !== lyra_brush_x_${interactionId}[1]`, "") + ifXY(" && ") + ifYElse(`lyra_brush_y_${interactionId}[0] !== lyra_brush_y_${interactionId}[1]`, ""),
                  "value": "white"
                },
                {
                  "value": null
                }
              ]
            }
          }
        }
      ]
    }
    return markSpec;
  });
  return sceneSpec;
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
      const {scale} = mark.encode.update.x as any;
      ret.scaleRecordX = state.getIn(['vis', 'present', 'scales', String(scale)]);
    }
    if (mark.encode.update.y) {
      const {scale} = mark.encode.update.y as any;
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

export function cleanSpecForPreview(sceneSpec, groupName): Spec {
  const sceneUpdated = duplicate(sceneSpec);
  sceneUpdated.marks = sceneUpdated.marks.filter(() => {
    // return markSpec.name && markSpec.type === 'group' ? markSpec.name === groupName : true; // remove top-level groups (views) other than the relevant one
    return true;
  }).map(markSpec => {
    if (markSpec.name && markSpec.type === 'group') { // don't touch manipulators, which don't have names
      markSpec.axes = markSpec.axes.map((axis) => {
        return {...axis, title: '', labels: false, ticks: false, domain: false};
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

      if (markSpec.name !== groupName) { // hide groups non-relevant to preview (but can't delete them in the case of multiview filtering)
        markSpec.clip = true;
        markSpec.encode.update.x = {"value": -999};
        markSpec.encode.update.y = {"value": -999};
      }
    }
    return markSpec;
  });

  return addBaseSignalsForPreview(sceneUpdated, groupName);
}

function addBaseSignalsForPreview(sceneSpec, groupName) {
  const sceneUpdated = duplicate(sceneSpec);
  sceneUpdated.marks = sceneUpdated.marks.map(markSpec => {
    if (markSpec.name && markSpec.name === groupName && markSpec.type === 'group') {
      markSpec.signals = editSignals(markSpec.signals, baseSignals);
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
    init: "60"
  },
  {
    name: "height",
    init: "60"
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
