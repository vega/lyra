import {Axis, GroupMark, Scale, DataRef, MultiDataRef} from "vega";
import {isSignalRef} from "vega-lite/build/src/vega.schema";
import {GuideRecord} from "../store/factory/Guide";
import {Map} from 'immutable';
import {ScaleRecord} from "../store/factory/Scale";
import {State} from "../store";
import {LyraInteractionPreviewDef} from "../components/interactions/InteractionPreviewController";
import * as React from 'react';
import {InteractionPreview as InteractionPreviewClass} from "../components/interactions/InteractionPreview";

export default function demonstrations(sceneSpec, state: State) {
  const sceneUpdated = {...sceneSpec};
  sceneUpdated.marks = sceneSpec.marks.map(markSpec => {
    if (markSpec.name && markSpec.type === 'group') { // don't touch manipulators, which don't have names
      const xScaleName = getScaleNameFromAxisRecords(state, 'x');
      const xFieldName = getFieldFromScaleRecordName(state, xScaleName);
      const yScaleName = getScaleNameFromAxisRecords(state, 'y');
      const yFieldName = getFieldFromScaleRecordName(state, yScaleName);

      if (!(xScaleName && xFieldName && yScaleName && yFieldName)) {
        // cannot currently demonstrate
        // likely the user has not created scales yet
        return markSpec;
      }

      return addMarksToGroup(addSignalsToGroup(markSpec, {xScaleName, xFieldName, yScaleName, yFieldName}));
    }
    return markSpec;
  });
  return sceneUpdated;
}

function addMarksToGroup(groupSpec: GroupMark): GroupMark {
  const groupUpdated = {...groupSpec};
  const marks = groupSpec.marks || (groupSpec.marks = []);
  groupUpdated.marks = [...marks,
    {
      "name": "brush_brush_bg",
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
            {
              "test": "data(\"brush_store\").length && data(\"brush_store\")[0].unit === \"\"",
              "signal": "lyra_brush_x[0]"
            },
            {
              "value": 0
            }
          ],
          "y": [
            {
              "test": "data(\"brush_store\").length && data(\"brush_store\")[0].unit === \"\"",
              "signal": "lyra_brush_y[0]"
            },
            {
              "value": 0
            }
          ],
          "x2": [
            {
              "test": "data(\"brush_store\").length && data(\"brush_store\")[0].unit === \"\"",
              "signal": "lyra_brush_x[1]"
            },
            {
              "value": 0
            }
          ],
          "y2": [
            {
              "test": "data(\"brush_store\").length && data(\"brush_store\")[0].unit === \"\"",
              "signal": "lyra_brush_y[1]"
            },
            {
              "value": 0
            }
          ]
        }
      }
    },
    {
      "name": "brush_brush",
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
            {
              "test": "data(\"brush_store\").length && data(\"brush_store\")[0].unit === \"\"",
              "signal": "lyra_brush_x[0]"
            },
            {
              "value": 0
            }
          ],
          "y": [
            {
              "test": "data(\"brush_store\").length && data(\"brush_store\")[0].unit === \"\"",
              "signal": "lyra_brush_y[0]"
            },
            {
              "value": 0
            }
          ],
          "x2": [
            {
              "test": "data(\"brush_store\").length && data(\"brush_store\")[0].unit === \"\"",
              "signal": "lyra_brush_x[1]"
            },
            {
              "value": 0
            }
          ],
          "y2": [
            {
              "test": "data(\"brush_store\").length && data(\"brush_store\")[0].unit === \"\"",
              "signal": "lyra_brush_y[1]"
            },
            {
              "value": 0
            }
          ],
          "stroke": [
            {
              "test": "lyra_brush_x[0] !== lyra_brush_x[1] && lyra_brush_y[0] !== lyra_brush_y[1]",
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
  return groupUpdated;
}

function addSignalsToGroup(groupSpec: GroupMark, names): GroupMark {
  const {xScaleName, xFieldName, yScaleName, yFieldName} = names;
  const groupUpdated = {...groupSpec};
  const signals = groupSpec.signals || (groupSpec.signals = []);
  groupUpdated.signals = [...signals,
    {
      "name": "lyra_brush_x",
      "update": "brush_x"
    },
    {
      "name": "lyra_brush_y",
      "update": "brush_y"
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
      "update": "vlSelectionResolve(\"brush_store\")"
    },
    {
      "name": "grid",
      "update": "vlSelectionResolve(\"grid_store\")"
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
              "!event.item || event.item.mark.name !== \"brush_brush\""
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
                  "!event.item || event.item.mark.name !== \"brush_brush\""
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
          "update": `[scale(\"${xScaleName}\", brush_${xFieldName}[0]), scale(\"${xScaleName}\", brush_${xFieldName}[1])]`
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
      "name": `brush_${xFieldName}`,
      "on": [
        {
          "events": {
            "signal": "lyra_brush_x"
          },
          "update": `lyra_brush_x[0] === lyra_brush_x[1] ? null : invert(\"${xScaleName}\", lyra_brush_x)`
        }
      ]
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
              "!event.item || event.item.mark.name !== \"brush_brush\""
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
                  "!event.item || event.item.mark.name !== \"brush_brush\""
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
          "update": `[scale(\"${yScaleName}\", brush_${yFieldName}[0]), scale(\"${yScaleName}\", brush_${yFieldName}[1])]`
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
      "name": `brush_${yFieldName}`,
      "on": [
        {
          "events": {
            "signal": "lyra_brush_y"
          },
          "update": `lyra_brush_y[0] === lyra_brush_y[1] ? null : invert(\"${yScaleName}\", lyra_brush_y)`
        }
      ]
    },
    {
      "name": "brush_scale_trigger",
      "value": {},
      "on": [
        {
          "events": [
            {
              "scale": "x"
            },
            {
              "scale": "y"
            }
          ],
          "update": `(!isArray(brush_${xFieldName}) || (+invert(\"${xScaleName}\", lyra_brush_x)[0] === +brush_${xFieldName}[0] && +invert(\"${xScaleName}\", lyra_brush_x)[1] === +brush_${xFieldName}[1])) && (!isArray(brush_${yFieldName}) || (+invert(\"${yScaleName}\", lyra_brush_y)[0] === +brush_${yFieldName}[0] && +invert(\"${yScaleName}\", lyra_brush_y)[1] === +brush_${yFieldName}[1])) ? brush_scale_trigger : {}`
        }
      ]
    },
    {
      "name": "brush_tuple",
      "on": [
        {
          "events": [
            {
              "signal": `brush_${xFieldName} || brush_${yFieldName}`
            }
          ],
          "update": `brush_${xFieldName} && brush_${yFieldName} ? {unit: \"\", fields: tuple_fields, values: [brush_${xFieldName},brush_${yFieldName}]} : null`
        }
      ]
    },
    {
      "name": "tuple_fields",
      "value": [
        {
          "field": xFieldName,
          "channel": "x",
          "type": "R"
        },
        {
          "field": yFieldName,
          "channel": "y",
          "type": "R"
        }
      ]
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
              "markname": "brush_brush"
            }
          ],
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
                  "markname": "brush_brush"
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
              "markname": "brush_brush"
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
              "markname": "brush_brush"
            }
          ],
          "force": true,
          "update": "pow(1.001, event.deltaY * pow(16, event.deltaMode))"
        }
      ]
    },
    {
      "name": "brush_modify",
      "update": "modify(\"brush_store\", brush_tuple, true)"
    },

    {
      "name": `grid_${xFieldName}`,
      "on": [
        {
          "events": {"signal": "grid_translate_delta"},
          "update": "panLinear(grid_translate_anchor.extent_x, -grid_translate_delta.x / width)"
        },
        {
          "events": {"signal": "grid_zoom_delta"},
          "update": `zoomLinear(domain(\"${xScaleName}\"), grid_zoom_anchor.x, grid_zoom_delta)`
        },
        {"events": [{"source": "scope", "type": "dblclick"}], "update": "null"}
      ]
    },
    {
      "name": `grid_${yFieldName}`,
      "on": [
        {
          "events": {"signal": "grid_translate_delta"},
          "update": "panLinear(grid_translate_anchor.extent_y, grid_translate_delta.y / height)"
        },
        {
          "events": {"signal": "grid_zoom_delta"},
          "update": `zoomLinear(domain(\"${yScaleName}\"), grid_zoom_anchor.y, grid_zoom_delta)`
        },
        {"events": [{"source": "scope", "type": "dblclick"}], "update": "null"}
      ]
    },
    {
      "name": "grid_tuple",
      "on": [
        {
          "events": [{"signal": `grid_${xFieldName} || grid_${yFieldName}`}],
          "update": `grid_${xFieldName} && grid_${yFieldName} ? {unit: \"\", fields: tuple_fields, values: [grid_${xFieldName},grid_${yFieldName}]} : null`
        }
      ]
    },
    {
      "name": "grid_translate_anchor",
      "value": {},
      "on": [
        {
          "events": [{"source": "scope", "type": "mousedown"}],
          "update": `{x: x(unit), y: y(unit), extent_x: domain(\"${xScaleName}\"), extent_y: domain(\"${yScaleName}\")}`
        }
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
        }
      ]
    },
    {
      "name": "grid_zoom_anchor",
      "on": [
        {
          "events": [{"source": "scope", "type": "wheel", "consume": true}],
          "update": `{x: invert(\"${xScaleName}\", x(unit)), y: invert(\"${yScaleName}\", y(unit))}`
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
      "update": "modify(\"grid_store\", grid_tuple, true)"
    }
  ];

  const data = groupSpec.data || (groupSpec.data = []);
  groupUpdated.data = [...data,
    {"name": "brush_store"},
    {"name": "grid_store"}
  ];

  return groupUpdated;
}

export function getScaleNameFromAxisRecords(state: State, axisType: 'x' | 'y'): string {
  const guides: Map<string, GuideRecord> = state.getIn(['vis', 'present', 'guides']);
  return guides.filter((axis) => {
    return axis.get('_gtype') == 'axis' && axisType === 'x' && (axis.get('orient') === 'top' || axis.get('orient') === 'bottom') ||
            axisType === 'y' && (axis.get('orient') === 'left' || axis.get('orient') === 'right');
  }).map((axis) => {
    return state.getIn(['vis', 'present', 'scales', axis.get('scale'), 'name']);
  }).first(null);
}

export function getFieldFromScaleRecordName(state: State, scaleName: string): string {
  const scales: Map<string, ScaleRecord> = state.getIn(['vis', 'present', 'scales']);
  return scales.filter((scale) => {
    return scale.get('name') === scaleName;
  }).map((scale) => {
    const domain = scale.get('_domain');
    // TODO(jzong) assume there is one domain?
    return domain[0].field;
  }).first(null);
}

export function resizeSpec(sceneSpec, width, height) {
  const sceneUpdated = {...sceneSpec};
  sceneUpdated.marks = sceneSpec.marks.map(markSpec => {
    const markUpdated = {...markSpec};
    if (markSpec.name && markSpec.type === 'group') { // don't touch manipulators, which don't have names
      markUpdated.encode.update.width.value = width;
      markUpdated.encode.update.height.value = height;
    }
    return markSpec;
  });
  return sceneUpdated;
}

export function cleanSpecForPreview(sceneSpec) {
  const sceneUpdated = {...sceneSpec};
  sceneUpdated.marks = sceneSpec.marks.map(markSpec => {
    const markUpdated = {...markSpec};
    if (markSpec.name && markSpec.type === 'group') { // don't touch manipulators, which don't have names
      markUpdated.axes = markSpec.axes.map((axis) => {
        return {...axis, title: ''};
      });
      markUpdated.legends = [];
    }
    return markUpdated;
  });
  return sceneUpdated;
}

export function editSignalsForPreview(sceneSpec, groupName, signals) {
  const sceneUpdated = {...sceneSpec};
  sceneUpdated.marks = sceneSpec.marks.map(markSpec => {
    const markUpdated = {...markSpec};
    if (markSpec.name && markSpec.name === groupName && markSpec.type === 'group') {
      markUpdated.signals = markSpec.signals.map(signal => {
        const match = signals.filter(s => s.name === signal.name);
        return match.length ? match[0] : signal;
      });
    }
    return markUpdated;
  });
  return sceneUpdated;
}

const baseSignals = [
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
  }];
export const intervalPreviewDefs: LyraInteractionPreviewDef[] = [
  {
    id: "brush",
    signals: [...baseSignals]
  },
  {
    id: "brush_x",
    signals: [...baseSignals,
      {
        name: "lyra_brush_x",
        init: "[width, 0]",
        on: [
          {
            "events": {
              "signal": "brush_x"
            },
            "update": "[width, 0]"
          }
        ]
      }
    ]
  },
  {
    id: "brush_y",
    signals: [...baseSignals,
      {
        name: "lyra_brush_y",
        init: "[0, height]",
        on: [
          {
            "events": {
              "signal": "brush_y"
            },
            "update": "[0, height]"
          }
        ]
      }
    ]
  }
]
