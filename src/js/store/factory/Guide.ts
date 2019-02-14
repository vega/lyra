import {Map, Record, RecordOf} from 'immutable';
import {Axis as VegaAxis, Legend as VegaLegend} from 'vega-typings';

const ORIENT = {x: 'bottom', y: 'left'};

export enum GuideType {
  Axis = 'axis',
  Legend = 'legend'
}

export type LyraAxis = {
  _gtype: GuideType,
  _id: number
} & VegaAxis;

export const Axis = Record<LyraAxis>({
  _gtype: GuideType.Axis,
  orient: null,
  scale: null,
  tickCount: 10, // replaces ticks
  tickSize: 10,
  grid: false,
  zindex: 0, // replaces layer
  _id: null
});

export type AxisRecord = RecordOf<LyraAxis>;

export type LyraLegend = {
  _gtype: GuideType,
  _id: number
} & VegaLegend;

export const Legend = Record<LyraLegend>({
  _gtype: GuideType.Legend,
  symbolFillColor: '#ffffff',
  symbolOpacity: 1,
  strokeColor: '#ffffff',
  strokeWidth: 0,
  _id: null
});

export type LegendRecord = RecordOf<LyraLegend>;

export type LyraGuide = LyraAxis | LyraLegend;
export type GuideRecord = AxisRecord | LegendRecord;

/**
 * A factory to produce a Lyra guide (axis or legend).
 *
 * @param {GuideType} gtype - Axis or Legend (use enumerated `Guide.GuideType`).
 * @param {string} type - Axis/legend type (e.g., `x` axis, or `fill` legend).
 * @param {number|Object} scale - The ID or Lyra Scale Primitive that backs the guide.
 *
 * @property {number} _gtype - Axis or Legend (based on enumerate `Guide.GuideType`).
 * @property {string} _type - Type for legends (e.g., `fill`, `stroke`, etc.).
 * @see Vega's {@link https://github.com/vega/vega/wiki/Axes|Axes} or
 * {@link https://github.com/vega/vega/wiki/Legends|Legends} documentation for
 * more information on this class' "public" properties.
 *
 * @constructor
 */

export function Guide(gtype : GuideType, type, scale) {
  if (gtype === GuideType.Axis) {
    return Axis({
      orient: ORIENT[type],
      scale: +scale || scale.get('_id') // TODO: Change when scale is modified
    });
    // guide.tickPadding = 5; // ???
    // guide.properties = {
    //   ticks: {
    //     stroke: {
    //       value: axisDef.tickColor
    //     },
    //     strokeWidth: {
    //       value: axisDef.tickWidth
    //     }
    //   },

    //   title: {
    //     fill: {
    //       value: axisDef.titleColor
    //     },
    //     fontSize: {
    //       value: axisDef.titleFontSize
    //     }
    //   },
    //   labels: {
    //     fill: {
    //       value: axisDef.tickLabelColor
    //     },
    //     fontSize: {
    //       value: axisDef.tickLabelFontSize
    //     },
    //     angle: {
    //       value: 0
    //     }
    //   },
    //   axis: {
    //     stroke: {
    //       value: axisDef.axisColor
    //     },
    //     strokeWidth: {
    //       value: axisDef.axisWidth
    //     }
    //   },
    //   grid: {
    //     stroke: {
    //       value: axisDef.gridColor
    //     },
    //     strokeWidth: {
    //       value: 1
    //     },
    //     strokeOpacity: {
    //       value: axisDef.gridOpacity
    //     }
    //   }
    // };
  } else if (gtype === GuideType.Legend) {
    return Legend({});
    // guide.properties = {
    //   title: {
    //     fill: {
    //       value: legendDef.titleColor
    //     },
    //     fontSize: {
    //       value: legendDef.titleFontSize
    //     }
    //   },
    //   labels: {
    //     fill: {
    //       value: legendDef.labelColor
    //     },
    //     fontSize: {
    //       value: legendDef.labelFontSize
    //     },
    //   },
    //   symbols: {
    //     shape: {
    //       value: legendDef.symbolShape
    //     },
    //     size: {
    //       value: legendDef.symbolSize
    //     },
    //     fill: {
    //       value: '#ffffff'
    //     },
    //     fillOpacity: {
    //       value: 1
    //     },
    //     stroke: {
    //       value: legendDef.symbolColor
    //     },
    //     strokeWidth: {
    //       value: legendDef.symbolStrokeWidth
    //     }
    //   },
    //   gradient: {
    //     stroke: {
    //       value: legendDef.gradientStrokeColor
    //     },
    //     strokeWidth: {
    //       value: legendDef.gradientStrokeWidth
    //     },
    //     height: {
    //       value: legendDef.gradientHeight
    //     },
    //     width: {
    //       value: legendDef.gradientWidth
    //     }
    //   },
    //   legend: {
    //     stroke: {
    //       value: '#ffffff'
    //     },
    //     strokeWidth: {
    //       value: 0
    //     }
    //   }
    // };
  }
};

export type GuideState = Map<string, GuideRecord>;
