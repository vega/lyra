import {Spec} from "vega";
import {ScaleRecord} from "../store/factory/Scale";
import {State} from "../store";
import duplicate from "../util/duplicate";
import {MarkRecord} from "../store/factory/Mark";
import {GroupRecord} from "../store/factory/marks/Group";
import {ScaleInfo, ApplicationRecord, SelectionRecord, PointSelectionRecord, MarkApplicationRecord, ScaleApplicationRecord, TransformApplicationRecord, IntervalSelectionRecord, InteractionInput, InteractionSignal} from "../store/factory/Interaction";
import {ColumnRecord, DatasetRecord} from "../store/factory/Dataset";
import {NOMINAL, ORDINAL, QUANTITATIVE, TEMPORAL} from "vega-lite/src/type";
import * as dsUtil from '../util/dataset-utils';
import {WidgetRecord, WidgetSelectionRecord} from "../store/factory/Widget";
import {Map} from 'immutable';

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

export function addInputsToScene(sceneSpec: Spec, groupName: string, interactionId: number, input: InteractionInput, scaleInfo: ScaleInfo, fieldsOfGroup: string[], exclusive?: boolean): Spec {
  const {xScaleName, yScaleName, xFieldName, yFieldName} = scaleInfo;
  const {ifXElse, ifYElse, ifXY} = conditionalHelpersForScales(scaleInfo);

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
  if (xScaleName && xFieldName) {
    sceneSpec = applySignals(sceneSpec, groupName, [
      {
        "name": `mouse_${xFieldName}_${interactionId}`,
        "on": [
          {
            "events": "mousemove",
            "update": `key_modifier_${interactionId} ? invert("${xScaleName}", mouse_x_${interactionId}) : mouse_${xFieldName}_${interactionId}`
          }
        ]
      }
    ])
  }
  if (yScaleName && yFieldName) {
    sceneSpec = applySignals(sceneSpec, groupName, [
      {
        "name": `mouse_${yFieldName}_${interactionId}`,
        "on": [
          {
            "events": "mousemove",
            "update": `key_modifier_${interactionId} ? invert("${yScaleName}", mouse_x_${interactionId}) : mouse_${yFieldName}_${interactionId}`
          }
        ]
      }
    ])
  }

  // Point
  sceneSpec = applySignals(sceneSpec, groupName, [
    {"name": `points_${interactionId}`, "update": `vlSelectionResolve(\"points_store_${groupName}_${interactionId}\")`},
    {
      "name": `lyra_is_point_projecting_${interactionId}`,
      "init": "false"
    },
    {
      "name": `lyra_points_tuple_${interactionId}`,
      "update": `lyra_is_point_projecting_${interactionId} ? points_tuple_projected_${interactionId} : points_tuple_${interactionId}`
    },
    {
      "name": `points_tuple_${interactionId}`,
      "on": [
        {
          "events": [Object.assign(
            {"source": "scope", "type": input && input.mouse !== 'drag' ? input.mouse : "click"},
            input && input.mouse && input.mouse === 'mouseover' && input.nearest ? {"markname": `voronoi_${interactionId}`} : {}
          )],
          "update": `datum && !datum.manipulator && item().mark.marktype !== 'group' ? (key_modifier_${interactionId} ? {unit: \"layer_0\", fields: points_tuple_fields_${interactionId}, values: [(item().isVoronoi ? datum.datum : datum)['_vgsid_']], datum: (item().isVoronoi ? datum.datum : datum)} : points_tuple_${interactionId} ) : null`,
          "force": true
        },
        {"events": [{"source": "scope", "type": "dblclick"}], "update": "null"}
      ]
    },
    {
      "name": `points_tuple_projected_${interactionId}`,
      "on": [
        {
          "events": [Object.assign(
            {"source": "scope", "type": input && input.mouse !== 'drag' ? input.mouse : "click"},
            input && input.mouse && input.mouse === 'mouseover' && input.nearest ? {"markname": `voronoi_${interactionId}`} : {}
          )],
          "update": `datum && !datum.manipulator && item().mark.marktype !== 'group' ? (key_modifier_${interactionId} ? {unit: \"layer_0\", fields: points_tuple_fields_${interactionId}, values: [(item().isVoronoi ? datum.datum : datum)['_vgsid_']], datum: (item().isVoronoi ? datum.datum : datum)} : points_tuple_projected_${interactionId} ) : null`,
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
      "update": `modify(\"points_store_${groupName}_${interactionId}\", lyra_points_tuple_${interactionId}, true, null)`
    }
  ]);
  sceneSpec = applySignals(sceneSpec, groupName, fieldsOfGroup.map(field => {
    return {
      "name": `point_${field}_${interactionId}`,
      "on": [
        {
          "events": {"signal": `lyra_points_tuple_${interactionId}`},
          "update": `lyra_points_tuple_${interactionId} && lyra_points_tuple_${interactionId}.datum ? lyra_points_tuple_${interactionId}.datum["${field}"] : null`,
        }
      ]
    }
  }));
  // Interval
  sceneSpec = addBrushMark(sceneSpec, groupName, interactionId, scaleInfo);
  sceneSpec = applySignals(sceneSpec, groupName, [
    {
      "name": `brush_x_start_${interactionId}`,
      "on": [
        {
          "events": {"signal": `lyra_brush_x_${interactionId}`},
          "update": `lyra_brush_x_${interactionId}[0]`
        }
      ]
    },
    {
      "name": `brush_x_end_${interactionId}`,
      "on": [
        {
          "events": {"signal": `lyra_brush_x_${interactionId}`},
          "update": `lyra_brush_x_${interactionId}[1]`
        }
      ]
    },
    {
      "name": `brush_y_start_${interactionId}`,
      "on": [
        {
          "events": {"signal": `lyra_brush_y_${interactionId}`},
          "update": `lyra_brush_y_${interactionId}[0]`
        }
      ]
    },
    {
      "name": `brush_y_end_${interactionId}`,
      "on": [
        {
          "events": {"signal": `lyra_brush_y_${interactionId}`},
          "update": `lyra_brush_y_${interactionId}[1]`
        }
      ]
    },
    {
      "name": ifXElse(`brush_${xFieldName}_${xScaleName}_start_${interactionId}`, `brush_x_field_undefined_start_${interactionId}`),
      "on": [
        {
          "events": {"signal": ifXElse(`brush_${xFieldName}_${xScaleName}_${interactionId}`, `brush_x_field_undefined_${interactionId}`)},
          "update": ifXElse(`brush_${xFieldName}_${xScaleName}_${interactionId} && brush_${xFieldName}_${xScaleName}_${interactionId}.length ? brush_${xFieldName}_${xScaleName}_${interactionId}[0] : null`, 'null')
        }
      ]
    },
    {
      "name": ifXElse(`brush_${xFieldName}_${xScaleName}_end_${interactionId}`, `brush_x_field_undefined_end_${interactionId}`),
      "on": [
        {
          "events": {"signal": ifXElse(`brush_${xFieldName}_${xScaleName}_${interactionId}`, `brush_x_field_undefined_${interactionId}`)},
          "update": ifXElse(`brush_${xFieldName}_${xScaleName}_${interactionId} && brush_${xFieldName}_${xScaleName}_${interactionId}.length ? brush_${xFieldName}_${xScaleName}_${interactionId}[1] : null`, 'null')
        }
      ]
    },
    {
      "name": ifYElse(`brush_${yFieldName}_${yScaleName}_start_${interactionId}`, `brush_y_field_undefined_start_${interactionId}`),
      "on": [
        {
          "events": {"signal": ifYElse(`brush_${yFieldName}_${yScaleName}_${interactionId}`, `brush_y_field_undefined_${interactionId}`)},
          "update": ifYElse(`brush_${yFieldName}_${yScaleName}_${interactionId} && brush_${yFieldName}_${yScaleName}_${interactionId}.length ? brush_${yFieldName}_${yScaleName}_${interactionId}[0] : null`, 'null')
        }
      ]
    },
    {
      "name": ifYElse(`brush_${yFieldName}_${yScaleName}_end_${interactionId}`, `brush_y_field_undefined_end_${interactionId}`),
      "on": [
        {
          "events": {"signal": ifYElse(`brush_${yFieldName}_${yScaleName}_${interactionId}`, `brush_y_field_undefined_${interactionId}`)},
          "update": ifYElse(`brush_${yFieldName}_${yScaleName}_${interactionId} && brush_${yFieldName}_${yScaleName}_${interactionId}.length ? brush_${yFieldName}_${yScaleName}_${interactionId}[1] : null`, 'null')
        }
      ]
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
          "update": ifXElse(`lyra_brush_x_${interactionId}[0] === lyra_brush_x_${interactionId}[1] ? null : invert(\"${xScaleName}\", lyra_brush_x_${interactionId})`, '')
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
          "update": ifYElse(`lyra_brush_y_${interactionId}[0] === lyra_brush_y_${interactionId}[1] ? null : invert(\"${yScaleName}\", lyra_brush_y_${interactionId})`, '')
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
      "name": ifXElse(`lyra_grid_${xFieldName}_${xScaleName}_${interactionId}`, `lyra_grid_x_field_undefined_${interactionId}`),
      "update": ifXElse(`lyra_brush_is_y_encoding_${interactionId} ? grid_translate_anchor_${interactionId}.extent_x : grid_${xFieldName}_${xScaleName}_${interactionId}`, `grid_x_field_undefined_${interactionId}`),
    },
    {
      "name": ifYElse(`lyra_grid_${yFieldName}_${yScaleName}_${interactionId}`, `lyra_grid_y_field_undefined_${interactionId}`),
      "update": ifYElse(`lyra_brush_is_x_encoding_${interactionId} ? grid_translate_anchor_${interactionId}.extent_y : grid_${yFieldName}_${yScaleName}_${interactionId}`, `grid_y_field_undefined_${interactionId}`),
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
          "events": [{"signal": ifXElse(`lyra_grid_${xFieldName}_${xScaleName}_${interactionId}`, "") + ifXY(" || ") + ifYElse(`lyra_grid_${yFieldName}_${yScaleName}_${interactionId}`, "")}],
          "update": ifXElse(`lyra_grid_${xFieldName}_${xScaleName}_${interactionId}`, "") + ifXY(" && ") + ifYElse(`lyra_grid_${yFieldName}_${yScaleName}_${interactionId}`, "") + `? {unit: \"\", fields: brush_tuple_fields_${interactionId}, values: [` + ifXElse(`lyra_grid_${xFieldName}_${xScaleName}_${interactionId}`, "") + ifXY(",") + ifYElse(`lyra_grid_${yFieldName}_${yScaleName}_${interactionId}`, "") + "]} : null"
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
  return sceneSpec;
}



export function addSelectionToScene(sceneSpec: Spec, groupName: string, interactionId: number, input: InteractionInput, selection: SelectionRecord): Spec {
  switch (selection.type) {
    case 'point':
        selection = selection as PointSelectionRecord;
        const field = selection.field;
        sceneSpec = removeBrushMark(sceneSpec, groupName);
        sceneSpec = applySignals(sceneSpec, groupName, [
          {
            "name": `lyra_is_point_projecting_${interactionId}`,
            "init": field && field !== "_vgsid_" ? "true" : "false"
          },
          {
            "name": `points_tuple_projected_${interactionId}`,
            "on": [
              {
                "events": [Object.assign(
                  {"source": "scope", "type": input && input.mouse !== 'drag' ? input.mouse : "click"},
                  input && input.mouse && input.mouse === 'mouseover' && input.nearest ? {"markname": `voronoi_${interactionId}`} : {}
                )],
                "update": `datum && !datum.manipulator && item().mark.marktype !== 'group' ? (key_modifier_${interactionId} ? {unit: \"layer_0\", fields: points_tuple_fields_${interactionId}, values: [(item().isVoronoi ? datum.datum : datum)['${field ? field : '_vgsid_'}']], datum: (item().isVoronoi ? datum.datum : datum)} : points_tuple_projected_${interactionId} ) : null`,
                "force": true
              },
              {"events": [{"source": "scope", "type": "dblclick"}], "update": "null"}
            ]
          },
          {
            "name": `points_tuple_fields_${interactionId}`,
            "value": [
              Object.assign(
                {"type": "E", "field": field ? field : '_vgsid_'},
                selection.encoding ? {"channel": selection.encoding} : {}
              )
            ]
          },
        ]);
        switch (selection.ptype) {
          case 'single':
            break;
          case 'multi':
            sceneSpec = applySignals(sceneSpec, groupName, [
              {
                "name": `points_toggle_${interactionId}`,
                "value": false, // TODO(jzong) i disagree with this default behavior in vega
                "on": [
                  {
                    "events": [Object.assign(
                      {"source": "scope", "type": input && input.mouse !== 'drag' ? input.mouse : "click"},
                      input && input.mouse && input.mouse === 'mouseover' && input.nearest ? {"markname": `voronoi_${interactionId}`} : {}
                    )],
                    "update": "event.shiftKey" // TODO(jzong) incorporate this into the event key customization logic
                  },
                  {"events": [{"source": "scope", "type": "dblclick"}], "update": "false"}
                ]
              }
            ]);
        }
        return sceneSpec;
    case 'interval':
        selection = selection as IntervalSelectionRecord;
        switch (selection.encoding) {
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
  let targetGroupName, targetMarkName;
  switch (application.type) {
    case 'mark':
      application = application as MarkApplicationRecord;
      targetGroupName = application.targetGroupName;
      targetMarkName = application.targetMarkName;
      const unselectedValue = application.unselectedValue;
      sceneSpec = applyMarkProperties(sceneSpec, targetGroupName, targetMarkName, {
        "encode": {
          "update": {
            [application.propertyName]: [
              {
                "test": isDemonstratingInterval ? `!(length(data(\"brush_store_${groupName}_${interactionId}\"))) || (vlSelectionTest(\"brush_store_${groupName}_${interactionId}\", datum))` :
                                                  `!(length(data(\"points_store_${groupName}_${interactionId}\"))) || (vlSelectionTest(\"points_store_${groupName}_${interactionId}\", datum))`,
              },
              {"value": unselectedValue}
            ],
          }
        }
      });
      return sceneSpec;
    case 'scale':
      application = application as ScaleApplicationRecord;
      // targetGroupName = application.targetGroupName; // TODO: support target group for scale applications
      targetGroupName = groupName;
      const scaleInfo = application.scaleInfo;
      sceneSpec = removeBrushMark(sceneSpec, groupName);
      sceneSpec = clipGroup(sceneSpec, groupName);
      return applyScaleProperties(sceneSpec, targetGroupName, [
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
      targetGroupName = application.targetGroupName;
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

export function pushSignalsInScene(sceneSpec: Spec, groupName: string, interactionSignals: InteractionSignal[]) {
  sceneSpec = duplicate(sceneSpec);
  interactionSignals.forEach(s => {
    if (s.push) {
      sceneSpec.signals = sceneSpec.signals || [];
      sceneSpec.signals = editSignals(sceneSpec.signals, [{"name": s.signal}]);

      sceneSpec.marks = sceneSpec.marks.map(markSpec => {
        if (markSpec.name && markSpec.name === groupName && markSpec.type === 'group') {
          markSpec.signals = markSpec.signals.map(gs => {
            if (gs.name === s.signal) {
              return {...gs, "push": "outer"};
            }
            return gs;
          });
        }
        return markSpec;
      });
    }
  })
  return sceneSpec;
}

export function addWidgetSelectionToScene(sceneSpec: Spec, widget: WidgetRecord, selection: WidgetSelectionRecord): Spec {
  sceneSpec = duplicate(sceneSpec);
  sceneSpec.signals = sceneSpec.signals || [];
  switch (selection.type) {
    case 'select':
      sceneSpec.signals = editSignals(sceneSpec.signals, [
        {
          "name": `widget_${widget.id}`,
          "bind": {
            name: widget.field.name,
            input: 'select',
            ...widgetParams(widget.field, widget.dsId)
          }
        }
      ]);
      return sceneSpec;
    case 'radio':
      sceneSpec.signals = editSignals(sceneSpec.signals, [
        {
          "name": `widget_${widget.id}`,
          "bind": {
            name: widget.field.name,
            input: 'radio',
            ...widgetParams(widget.field, widget.dsId)
          }
        }
      ]);
      return sceneSpec;
    case 'range':
      const params = widgetParams(widget.field, widget.dsId)
      sceneSpec.signals = editSignals(sceneSpec.signals, [
        {
          "name": `widget_${widget.id}`,
          "bind": {
            name: widget.field.name,
            input: 'range',
            min: params.min,
            max: params.max,
            step: selection.step || params.step
          }
        }
      ]);
      return sceneSpec;
    default:
      return sceneSpec;
  }
}

export function addWidgetApplicationToScene(sceneSpec: Spec, groupName: string, widget: WidgetRecord, application: MarkApplicationRecord): Spec {
  if (!widget.selection) return sceneSpec;
  const targetMarkName = application.targetMarkName;
  const unselectedValue = application.unselectedValue;
  return applyMarkProperties(sceneSpec, groupName, targetMarkName, {
    "encode": {
      "update": {
        [application.propertyName]: [
          {
            "test": `datum.${widget.field.name} ${widget.selection.comparator} widget_${widget.id}`,
          },
          {"value": unselectedValue}
        ],
      }
    }
  });
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
      return mapNestedMarksOfGroup(markSpec, (mark) => {
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
                if (Array.isArray(oldValue) && oldValue.length) {
                  if (oldValue[0].test && !value[0].test.includes(oldValue[0].test)) {
                    value[0].test = value[0].test + ' && ' + oldValue[0].test;
                  }
                  value[0] = {...oldValue[0], ...value[0]};
                }
                else {
                  value[0] = {...value[0], ...oldValue};
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
      markSpec.marks = markSpec.marks.filter(mark => !(mark.name && mark.name.startsWith('lyra_brush')));
    }
    return markSpec;
  });
  return sceneSpec;
}

function clipGroup(sceneSpec, groupName: string): Spec {
  sceneSpec = duplicate(sceneSpec);
  sceneSpec.marks = sceneSpec.marks.map(markSpec => {
    if (markSpec.name && markSpec.name === groupName && markSpec.type === 'group') {
      return mapNestedMarksOfGroup(markSpec, (mark) => {
        mark.clip = true;
        return mark;
      });
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

export function addVoronoiMark(sceneSpec, groupName: string, encoding: 'x' | 'y', targetMarkName: string, interactionId: number, applicationId: string): Spec {
  sceneSpec = duplicate(sceneSpec);
  sceneSpec.marks = sceneSpec.marks.map(markSpec => {
    if (markSpec.name && markSpec.name === groupName && markSpec.type === 'group') {
      const targetMarkPresent = markSpec.marks.find(mark => mark.name === targetMarkName);
      if (targetMarkPresent) {
        markSpec.marks = markSpec.marks.filter(mark => mark.name !== `voronoi_${interactionId}`);
        markSpec.marks = [
          ...markSpec.marks,
          {
            "name": `voronoi_${interactionId}`,
            "type": "path",
            "interactive": true,
            "from": {"data": targetMarkName},
            "encode": {
              "update": {
                "fill": {"value": "transparent"},
                "strokeWidth": {"value": 0.35},
                "stroke": {"value": "transparent"},
                // "stroke": {"value": "#333"}, // for debugging
                "isVoronoi": {"value": true}
              }
            },
            "transform": [
              {
                "type": "voronoi",
                "x": {"expr": encoding === 'y' ? "0" : "datum.datum.x || 0"},
                "y": {"expr": encoding === 'x' ? "0" : "datum.datum.y || 0"},
                "size": [{"signal": "width"}, {"signal": "height"}]
              }
            ]
          }
        ];
      }
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

export function getFieldsOfGroup(state: State, groupId: number): string[] {
  const group: GroupRecord = state.getIn(['vis', 'present', 'marks', String(groupId)])

  const marksOfGroup = getNestedMarksOfGroup(state, group);

  let fieldsOfGroup = [];
  const markWithData = marksOfGroup.find(mark => mark.from && mark.from.data); // TODO(jzong): multiple datasets same group?
  if (markWithData) {
    const dsId = String(markWithData.from.data);
    const dataset: DatasetRecord =  state.getIn(['vis', 'present', 'datasets', String(dsId)]);
    const schema = dataset.get('_schema');
    const fields = schema.keySeq().toArray();
    fieldsOfGroup = fields;
  }
  return fieldsOfGroup;
}


export function getScaleInfoForGroup(state: State, groupId: number): ScaleInfo {
  const {scaleRecordX, scaleRecordY} = getScaleRecords(state, groupId);
  return {
    xScaleName: scaleRecordX ? scaleRecordX.get('name') : null,
    xFieldName: scaleRecordX && scaleRecordX.get('_domain').length > 0 ?  scaleRecordX.get('_domain')[0].field : null,
    yScaleName: scaleRecordY ? scaleRecordY.get('name') : null,
    yFieldName: scaleRecordY && scaleRecordY.get('_domain').length > 0 ? scaleRecordY.get('_domain')[0].field : null,
  };
}

export function cleanSpecForPreview(sceneSpec, width: number, height: number, groupName: string, interactionId: number): Spec {
  const sceneUpdated = duplicate(sceneSpec);
  sceneUpdated.autosize = "none";
  sceneUpdated.marks = sceneUpdated.marks.map(markSpec => {
    if (markSpec.name && markSpec.type === 'group') { // don't touch manipulators, which don't have names
      const oldWidth = markSpec.encode?.update?.width?.value || 640;
      const oldHeight = markSpec.encode?.update?.height?.value || 360;
      const wScale = width / oldWidth; // preview width / main view width
      const hScale = height / oldHeight; // preview height / main view height

      markSpec.axes = markSpec.axes.map((axis) => {
        return {...axis, title: '', labels: false, ticks: false, domain: false};
      });
      markSpec.legends = [];
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
        return mark;
      });

      if (markSpec.name !== groupName) { // hide groups non-relevant to preview (but can't delete them in the case of multiview filtering)
        markSpec.encode.update.x = {"value": -999};
        markSpec.encode.update.y = {"value": -999};
      }

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

  return addBaseSignalsForPreview(sceneUpdated, groupName, interactionId);
}

function addBaseSignalsForPreview(sceneSpec, groupName, interactionId) {
  const sceneUpdated = duplicate(sceneSpec);
  const baseSignalsScoped = baseSignals.map(s => {
    if (s.name === 'width' || s.name === 'height') return s;
    return {
      ...s,
      name: `${s.name}_${interactionId}`
    }
  });
  sceneUpdated.marks = sceneUpdated.marks.map(markSpec => {
    if (markSpec.name && markSpec.name === groupName && markSpec.type === 'group') {
      markSpec.signals = editSignals(markSpec.signals, baseSignalsScoped);
    }
    return markSpec;
  });
  return sceneUpdated;
}

export function editSignals(specSignals, interactionSignals) {
  const removeOldValues = specSignals.filter(signal => {
    return interactionSignals.every(newSignal => newSignal.name !== signal.name);
  });
  return removeOldValues.concat(interactionSignals);
  // return specSignals.map(signal => {
  //   const match = interactionSignals.find(s => s.name === signal.name);
  //   return match ? match : signal;
  // }).concat(interactionSignals.filter(signal => {
  //   return !specSignals.find(s => s.name === signal.name);
  // }));
}

const baseSignals = [
  {
    name: "width",
    init: "75"
  },
  {
    name: "height",
    init: "75"
  },
  {
    name: "mouse_x",
    init: "null"
  },
  {
    name: "mouse_y",
    init: "null"
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

export function widgetParams(fieldDef: ColumnRecord, id: number) {
  const type = fieldDef.mtype;
  const data = dsUtil.output(id);
  let fieldValues = data.map(e => e[fieldDef.name]);
  if (type === NOMINAL || type === ORDINAL) {
    fieldValues = [...new Set(fieldValues)];
    if (fieldValues.length > 50) {
      // TODO What to do for very large number of options?
      fieldValues = fieldValues.slice(0, 50);
    }
    return {options: fieldValues};
  }
  else if (type === QUANTITATIVE || type === TEMPORAL) {
    fieldValues = fieldValues.sort((a,b)=> a-b);
    const length = fieldValues.length;
    const isInteger = fieldValues.every(v => Number.isInteger(v));
    return {
      max: fieldValues[length-1],
      min: fieldValues[0],
      step: isInteger ? 1 : 0.1
    }
  }
  else {
    // TODO: other types?
  }
}

/**
 * Returns all non-group, non-lyra marks that are children of a group or its subgroups.
 * @param group
 */
export function getNestedMarksOfGroup(state: State, group: GroupRecord): MarkRecord[] {
  if (!group) return [];
  return group.marks.map(markId => {
    const mark = state.getIn(['vis', 'present', 'marks', String(markId)]);
    if (mark.type === 'group') {
      return getNestedMarksOfGroup(state, group);
    }
    return mark;
  }).filter((mark) => {
    return !mark.name.startsWith('lyra');
  });
}

/**
 * Applies fn to all non-group, non-lyra marks that are children of groupSpec or its subgroups. Returns copy of groupSpec with changes applied
*/
export function mapNestedMarksOfGroup(groupSpec, fn: (mark: any) => any) {
  groupSpec = duplicate(groupSpec);
  groupSpec.marks = groupSpec.marks.map(mark => {
    if (mark.name && mark.name.startsWith('lyra')) return mark;
    if (mark.type === 'group') {
      return mapNestedMarksOfGroup(mark, fn);
    }
    return fn(mark);
  });
  return groupSpec;
}
