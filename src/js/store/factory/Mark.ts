import {Map} from 'immutable';
import {TopLevel} from 'vega-lite/src/spec';
import {DataMixins} from 'vega-lite/src/spec/base';
import {NormalizedUnitSpec} from 'vega-lite/src/spec/unit';
import {Facet, OnEvent} from 'vega-typings';
import {Area, AreaRecord, getHandleStreams as areaHandleStreams, LyraAreaMark} from './marks/Area';
import {Group, GroupRecord, LyraGroupMark} from './marks/Group';
import {getHandleStreams as lineHandleStreams, Line, LineRecord, LyraLineMark} from './marks/Line';
import {getHandleStreams as rectHandleStreams, LyraRectMark, Rect, RectRecord} from './marks/Rect';
import {getHandleStreams as symbolHandleStreams, LyraSymbolMark, Symbol, SymbolRecord} from './marks/Symbol';
import {getHandleStreams as textHandleStreams, LyraTextMark, Text, TextRecord} from './marks/Text';

// TODO(jzong) reconcile this with vega typings marktype
// export type LyraMarkType = MarkType | 'scene';
export type LyraMarkType = 'symbol' | 'area' | 'line' | 'rect' | 'text' | 'group';

// Default visual properties for marks.
const defaults = {
  encode: {
    update: {
      x: {value: 100},
      y: {value: 100},
      fill: {value: '#4682b4'},
      fillOpacity: {value: 1},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0},
    }
  }
};

export type LyraVegaLiteSpec = TopLevel<NormalizedUnitSpec> & DataMixins;

export interface LyraMarkMeta {
  _id: number;
  _parent: number;
  _vlUnit: LyraVegaLiteSpec;
}

export interface LyraPathFacet {
  _facet: Facet
}

export type LyraMark = LyraAreaMark | LyraGroupMark | LyraLineMark | LyraRectMark | LyraSymbolMark | LyraTextMark;
export type MarkRecord = AreaRecord | GroupRecord | LineRecord | RectRecord | SymbolRecord | TextRecord;

/**
 * A factory to produce Lyra marks.
 *
 * @param   {string} type   A mark type (area, group, line, rect, scene, symbol or text).
 * @param   {Object} props  Default visual properties of the mark.
 * @returns {Object} A Lyra mark definition.
 */
export function Mark(type: LyraMarkType, values?: Partial<LyraMark>): MarkRecord {
  switch(type) {
    case 'symbol': return Symbol(values as Partial<LyraSymbolMark>).mergeDeepWith(mergeComparator, defaults);
    case 'area': return Area(values as Partial<LyraAreaMark>).mergeDeepWith(mergeComparator, defaults);
    case 'line': return Line(values as Partial<LyraLineMark>).mergeDeepWith(mergeComparator, {
      encode: {
        update: {
          ...defaults.encode.update,
          fill: undefined,
          fillOpacity: undefined
        }
      }
    });
    case 'rect': return Rect(values as Partial<LyraRectMark>).mergeDeepWith(mergeComparator, defaults);
    case 'text': return Text(values as Partial<LyraTextMark>).mergeDeepWith(mergeComparator, defaults);
    case 'group': return Group(values as Partial<LyraGroupMark>).mergeDeepWith(mergeComparator, defaults);
  }
}

/**
 * Compares two values and returns the new value if the old one is undefined.
 * In the special case that the old value is null, returns undefined.
 * @param oldVal the value in the source object
 * @param newVal the value in the new object (to be merged)
 */
const mergeComparator = (oldVal, newVal) => {
  return oldVal !== undefined ? (oldVal === null ? undefined : oldVal ) : newVal;
};

export type MarkState = Map<string, MarkRecord>;

export interface HandleStreams {[s: string]: OnEvent[];}

/**
 * Return an object of signal stream definitions for handle manipulators for the
 * specified mark.
 *
 * @param {Object} mark - A mark properties object or instantiated mark
 * @param {number} mark._id - A numeric mark ID
 * @param {string} mark.type - A mark type, such as "text" or "rect"
 * @returns {Object} A dictionary of signal stream definitions
 */
Mark.getHandleStreams = function(mark: MarkRecord): HandleStreams {
  switch(mark.type) {
    case 'symbol': return symbolHandleStreams(mark);
    case 'area': return areaHandleStreams(mark);
    case 'line': return lineHandleStreams(mark);
    case 'text': return textHandleStreams(mark);
    case 'group':
    case 'rect': return rectHandleStreams(mark as any);
  }
};
