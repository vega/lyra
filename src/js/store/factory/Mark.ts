import {MarkType} from 'vega-typings';
import {Area, AreaRecord, getHandleStreams as areaHandleStreams, LyraAreaMark} from './marks/Area';
import {Group, GroupRecord, LyraGroupMark} from './marks/Group';
import {getHandleStreams as lineHandleStreams, Line, LineRecord, LyraLineMark} from './marks/Line';
import {getHandleStreams as rectHandleStreams, LyraRectMark, Rect, RectRecord} from './marks/Rect';
import {LyraSceneMark, Scene, SceneRecord} from './marks/Scene';
import {getHandleStreams as symbolHandleStreams, LyraSymbolMark, Symbol, SymbolRecord} from './marks/Symbol';
import {getHandleStreams as textHandleStreams, LyraTextMark, Text, TextRecord} from './marks/Text';

const capitalize = require('capitalize');
const counter = require('../../util/counter');

// export type LyraMarkType = MarkType | 'scene';
export type LyraMarkType = 'symbol' | 'area' | 'line' | 'rect' | 'text' | 'group' | 'scene';

function name(type: LyraMarkType) {
  return capitalize(type) + ' ' + counter.type('marks');
}

// Default visual properties for marks.
const defaults = {
  encode: {
    update: {
      x: {value: 100},
      y: {value: 100},
      fill: {value: '#4682b4'},
      fillOpacity: {value: 1},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0.25}
    }
  }
};

export type LyraMark = LyraAreaMark | LyraGroupMark | LyraLineMark | LyraRectMark | LyraSceneMark | LyraSymbolMark | LyraTextMark;
export type MarkRecord = AreaRecord | GroupRecord | LineRecord | RectRecord | SceneRecord | SymbolRecord | TextRecord;

/**
 * A factory to produce Lyra marks.
 *
 * @param   {string} type   A mark type (area, group, line, rect, scene, symbol or text).
 * @param   {Object} props  Default visual properties of the mark.
 * @returns {Object} A Lyra mark definition.
 */
export function Mark(type: LyraMarkType, values?: Partial<LyraMark>): MarkRecord {
  switch(type) {
    case 'symbol': return Symbol({
        name: values && values.name || name(type)
      }).mergeDeepWith((oldVal, newVal) => oldVal, defaults);
    case 'area': return Area({
        name: values && values.name || name(type)
      }).mergeDeepWith((oldVal, newVal) => oldVal, defaults);
    case 'line': return Line({
        name: values && values.name || name(type)
      }).mergeDeepWith((oldVal, newVal) => oldVal, defaults);
    case 'rect': return Rect({
        name: values && values.name || name(type)
      }).mergeDeepWith((oldVal, newVal) => oldVal, defaults);
    case 'text': return Text({
        name: values && values.name || name(type)
      }).mergeDeepWith((oldVal, newVal) => oldVal, defaults);
    case 'group': return Group({
        name: values && values.name || name(type)
      }).mergeDeepWith((oldVal, newVal) => oldVal, defaults);
    case 'scene': return Scene({
        name: values && values.name || name(type)
      }).mergeDeepWith((oldVal, newVal) => oldVal, defaults);
  }
}

/**
 * Return an object of signal stream definitions for handle manipulators for the
 * specified mark.
 *
 * @param {Object} mark - A mark properties object or instantiated mark
 * @param {number} mark._id - A numeric mark ID
 * @param {string} mark.type - A mark type, such as "text" or "rect"
 * @returns {Object} A dictionary of signal stream definitions
 */
Mark.getHandleStreams = function(mark: MarkRecord) {
  switch(mark.type) {
    case 'symbol': return symbolHandleStreams(mark);
    case 'area': return areaHandleStreams(mark);
    case 'line': return lineHandleStreams(mark);
    case 'text': return textHandleStreams(mark);
    case 'group':
    case 'rect': return rectHandleStreams(mark);
  }
};

/**
 * Custom extend method that deletes undefined keys.
 * @param   {Object} obj Javascript object to extend
 * @returns {Object}     Extended Javascript object.
 */
// function extend(obj) {
//   for (let x, key, i = 1, len = arguments.length; i < len; ++i) {
//     x = arguments[i];
//     for (key in x) {
//       obj[key] = x[key];
//       if (x[key] === undefined) {
//         delete obj[key];
//       }
//     }
//   }
//   return obj;
// }
