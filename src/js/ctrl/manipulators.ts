import {Bounds, extend} from 'vega';
import {CELL, MODE, SELECTED} from '../store/factory/Signal';
import exportName from '../util/exportName';
const ns = require('../util/ns');

// Mode = handles | connectors | channels | altchannels
// Manipulators = handle | connector | arrow | span | point | border
// This differentiation is needed because channels and altchannels
// display multiple manipulators.

export default function manipulators(mark, spec) {
  const markName = exportName(mark.name);
  const manipName = `${markName}_manipulators`;
  return [spec,
    {
      type: 'group',
      data: [
        {
          name: manipName,
          source: markName,
          transform: [{
            type: ns('manipulators_' + mark.type),
            lyra_id: mark._id,
            lyra_selected: {signal: SELECTED},
            lyra_mode: {signal: MODE}
          }]
        },
        {
          name: `${manipName}_handles`,
          source: manipName,
          transform: [{type: 'filter', expr: 'datum.manipulator === "handle"'}]
        },
        {
          name: `${manipName}_connectors`,
          source: manipName,
          transform: [
            {type: 'filter', expr: 'warn(datum) && datum.manipulator === "connector"'},
            {type: 'voronoi', x: 'x', y: 'y'}
          ]
        }
      ],
      marks: [
        extend({}, {from: {data: `${manipName}_handles`}}, handle),
        extend({}, {from: {data: `${manipName}_connectors`}}, connector),
        extend({}, {from: {data: `${manipName}_connectors`}}, voronoi)
      ]
    }
  ];
}

export const LARGE = 40;
export const SMALL = 20;
export const PADDING = 7;
export const ARROWHEAD = 7;

export function size(b/*: Bounds*/) {
  return b.width() < SMALL || b.height() < SMALL
    ? SMALL : LARGE;
}

export function coords(b, manipulator) {
  const c = {
    topLeft: {x: b.x1, y: b.y1, cursor: 'nw-resize'},
    topCenter: {x: b.x1 + (b.width() / 2), y: b.y1, cursor: 'n-resize'},
    topRight: {x: b.x2, y: b.y1, cursor: 'ne-resize'},
    midLeft: {x: b.x1, y: b.y1 + (b.height() / 2), cursor: 'w-resize'},
    midCenter: {x: b.x1 + (b.width() / 2), y: b.y1 + (b.height() / 2), cursor: 'move'},
    midRight: {x: b.x2, y: b.y1 + (b.height() / 2), cursor: 'e-resize'},
    bottomLeft: {x: b.x1, y: b.y2, cursor: 'sw-resize'},
    bottomCenter: {x: b.x1 + (b.width() / 2), y: b.y2, cursor: 's-resize'},
    bottomRight: {x: b.x2, y: b.y2, cursor: 'se-resize'}
  };

  if (manipulator) {
    for (const [key, value] of Object.entries(c)) {
      c[key] = extend({}, {size: size(b), key, manipulator}, value);
    }
  }

  return c;
};

const hoverCell = (t, f) => [{test: `${CELL}.key === datum.key`, ...t}, f];

const voronoi = {
  type: 'path',
  name: CELL,
  encode: {
    update: {
      path: {field: 'path'},
      key: {field: 'key'},
      tooltip: {field: 'tooltip'},
      fill: {value: 'transparent'},
      strokeWidth: {value: 0.35},
      stroke: {value: 'brown'}
    }
  }
}

// function border(spec) {
//   let props = dl.duplicate(spec.encode.update),
//       markType = spec.type,
//       pathMark = markType === 'line' || markType === 'area';

//   dl.keys(props).forEach(function(k) {
//     props[k] = {field: {parent: k}};
//   });

//   props.fill = undefined;
//   props.stroke = hoverCell({value: 'lightsalmon'}, {value: 'cyan'}, true);
//   props.strokeWidth = {value: markType === 'text' ? 1 : 3};

//   if (pathMark) {
//     props.x = props.y = undefined;
//     props.path = {field: {parent: 'path'}};
//   }

//   return {
//     type: 'group',
//     from: {
//       transform: [{type: 'filter', test: 'datum.manipulator === "border"'}]
//     },
//     marks: [{
//       type: pathMark ? 'path' : markType,
//       encode: {update: props}
//     }, voronoi(true)]
//   };
// }

const handle = {
  type: 'symbol',
  encode: {
    update: {
      x: {field: 'x'},
      y: {field: 'y'},
      shape: {value: 'square'},
      size: {field: 'size'},
      fill: {value: 'white'},
      stroke: {value: 'black'},
      strokeWidth: {value: 0.5}
    },
    hover: {
      cursor: {field: 'cursor'}
    }
  }
};

const connector = {
  type: 'symbol',
  encode: {
    update: {
      x: {field: 'x'},
      y: {field: 'y'},
      shape: {value: 'diamond'},
      size: {field: 'size'},
      fill: {value: 'white'},
      stroke: hoverCell({value: 'lightsalmon'}, {value: 'cyan'}),
      strokeWidth: {value: 0.5}
    }
  }
};

// TYPES.push(manipulators.ARROW = {
//   type: 'group',
//   from: {
//     transform: [
//       {type: 'filter', test: 'datum.manipulator === "arrow"'},
//       {type: 'facet', groupby: ['key']}
//     ]
//   },
//   marks: [{
//     type: 'line',
//     encode: {
//       update: {
//         x: {field: 'x'},
//         y: {field: 'y'},
//         fill: hoverCell({value: 'lightsalmon'}, {value: 'cyan'}),
//         stroke: hoverCell({value: 'lightsalmon'}, {value: 'cyan'}),
//         strokeWidth: {value: 3}
//       }
//     }
//   }, voronoi()]
// });

// TYPES.push(manipulators.SPAN = dl.extend({}, manipulators.ARROW, {
//   from: {
//     transform: [
//       {type: 'filter', test: 'datum.manipulator === "span"'},
//       {type: 'facet', groupby: ['key']}
//     ]
//   }
// }));

// manipulators.BUBBLE_CURSOR = {
//   type: 'line',
//   from: {data: 'bubble_cursor'},
//   encode: {
//     update: {
//       x: {field: 'x'},
//       y: {field: 'y'},
//       fill: {value: 'lightsalmon'},
//       fillOpacity: {value: 0.2}
//     }
//   }
// };

// manipulators.BUBBLE_CURSOR_TIP = [{
//   type: 'text',
//   encode: {
//     update: {
//       x: {signal: sg.MOUSE + '.x'},
//       y: {signal: sg.MOUSE + '.y'},
//       dy: {value: 30},
//       text: {signal: sg.CELL + '.tooltip'},
//       align: {value: 'center'},
//       baseline: {value: 'bottom'},
//       stroke: {value: 'white'},
//       strokeWidth: {value: 4},
//       fontSize: {value: 12},
//       fontFamily: {value: 'Lato'},
//       fontWeight: {value: 'bold'}
//     }
//   }
// }, {
//   type: 'text',
//   encode: {
//     update: {
//       x: {signal: sg.MOUSE + '.x'},
//       y: {signal: sg.MOUSE + '.y'},
//       dy: {value: 30},
//       text: {signal: sg.CELL + '.tooltip'},
//       align: {value: 'center'},
//       baseline: {value: 'bottom'},
//       fill: {value: 'lightsalmon'},
//       fontSize: {value: 12},
//       fontFamily: {value: 'Lato'},
//       fontWeight: {value: 'bold'}
//     }
//   }
// }];