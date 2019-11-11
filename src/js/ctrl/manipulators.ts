import {Bounds, extend} from 'vega';
import {CELL, MODE, SELECTED} from '../store/factory/Signal';
import duplicate from '../util/duplicate';
import exportName from '../util/exportName';
const ns = require('../util/ns');

// Mode = handles | connectors | channels | altchannels
// Manipulators = handle | connector | arrow | span | point | border
// This differentiation is needed because channels and altchannels
// display multiple manipulators.

export default function manipulators(mark, spec) {
  const markName = exportName(mark.name);
  const manipName = `${markName}_manipulators`;
  const peek = `peek(data("${manipName}"))`;
  const signals = Object.values(mark.encode.update)
    .filter((s:any) => s && !!s.signal)
    .map((s:any) => ({signal: s.signal}));

  return [spec,
    {
      type: 'group',
      data: [
        {
          name: manipName,
          transform: [
            {
              type: ns('manipulators_' + mark.type),
              lyra_id: mark._id,
              lyra_selected: {signal: SELECTED},
              lyra_mode: {signal: MODE},
              signals
            },
            {
              type: 'window',
              ops: ['min', 'max', 'min', 'max'],
              fields: ['x', 'x', 'y', 'y']
            }
          ]
        },
        {
          name: 'voronoi',
          source: manipName,
          transform: [{
            type: 'voronoi',
            x: 'x', y: 'y',
            as: 'lyra_cell_path',
            extent: [
              {signal: `data("${manipName}")[0] ? [${peek}.min_x - 100, ${peek}.min_y - 50] : [0, 0]`},
              {signal: `data("${manipName}")[0] ? [${peek}.max_x + 100, ${peek}.max_y + 50] : [0, 0]`}
            ]
          }]
        },
        dataset('handle', manipName),
        dataset('connector', manipName),
        dataset('arrow', manipName),
        dataset('span', manipName),
        dataset('border', manipName)
      ],
      marks: [
        handle,
        connector,
        arrowSpan('arrow'),
        arrowSpan('span'),
        border(spec),
        voronoi
      ]
    }
  ];
}

export const LARGE = 40;
export const SMALL = 20;
export const PADDING = 7;
export const ARROWHEAD = 7;

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

const size = (b/*: Bounds*/) => b.width() < SMALL || b.height() < SMALL ? SMALL : LARGE;

const hoverCell = (t, f) => [{test: `${CELL}.key === datum.key`, ...t}, f];

const dataset = (name: string, source: string) => ({
  name,
  source,
  transform: [{type: 'filter', expr: `datum.manipulator === "${name}"`}]
});

const voronoi = {
  type: 'path',
  from: {data: 'voronoi'},
  role: CELL,
  encode: {
    update: {
      path: {field: 'lyra_cell_path'},
      key: {field: 'key'},
      tooltip: {field: 'tooltip'},
      strokeWidth: {value: 0.35},
      stroke: {value: 'transparent'},
      fill: [
        // Handles should be directly manipulable, rather than proxied via voronoi cells.
        {test: 'datum.manipulator === "handle"', value: null},
        {value: 'transparent'}
      ],
    },
    hover: {
      cursor: [
        {test: 'datum.manipulator === "handle"', field: 'cursor'},
        {value: null}
      ]
    }
  }
};

function border(spec) {
  const update = duplicate(spec.encode.update),
    markType = spec.type,
    pathMark = markType === 'line' || markType === 'area';

  for (const key of Object.keys(update)) {
    update[key] = {field: key};
  }

  delete update.fill;
  update.stroke = hoverCell({value: 'lightsalmon'}, {value: 'cyan'});
  update.strokeWidth = {value: markType === 'text' ? 1 : 3};

  if (pathMark) {
    delete update.x;
    delete update.y;
    update.path = {field: 'path'};
  }

  return {
    type: pathMark ? 'path' : markType,
    from: {data: 'border'},
    encode: {update}
  };
}

const handle = {
  type: 'symbol',
  from: {data: 'handle'},
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
  from: {data: 'connector'},
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

const arrowSpan = (data: string) => ({
  type: 'group',
  from: {
    facet: {
      data,
      name: 'facet',
      groupby: 'key'
    }
  },
  marks: [{
    type: 'line',
    from: {data: 'facet'},
    encode: {
      update: {
        x: {field: 'x'},
        y: {field: 'y'},
        fill: hoverCell({value: 'lightsalmon'}, {value: 'cyan'}),
        stroke: hoverCell({value: 'lightsalmon'}, {value: 'cyan'}),
        strokeWidth: {value: 3}
      }
    }
  }]
});

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
