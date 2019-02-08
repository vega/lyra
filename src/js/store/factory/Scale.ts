import {Map, Record, RecordOf} from 'immutable';

/**
 * Scales are functions that transform a domain of data values (numbers, dates, strings, etc.) to a range of visual values (pixels, colors, sizes).
 */
export interface LyraScale {
  /**
   * Unique id for scale.
   */
  _id: number;

  /**
   * Original scale name
   */
  _origName: string;

  /**
   * Initial name of the scale; it may be renamed to prevent name collisions.
   */
  name: string;

  /**
   * Scale type (e.g., ordinal, linear, etc.).
   */
  type: string | any; // TODO

  /**
   * An array of literal domain values
   */
  domain: any[];

  /**
   * An array of literal range values, or a preset range string (e.g., width, height).
   */
  range: string[] | string;


  _domain: [],
  _range: [],

  nice: null,
  round: null,
  points: null,
  padding: null
}

const names = {};

// Scales churn (unused scales are deleted) and thus we want to reuse names
// as much as possible.
function rename(name) {
  let count = 1;
  let str = name;
  while (names[str]) {
    str = name + '' + ++count;
  }
  return (names[str] = 1, str);
}

// /**
//  * A factory to produce Lyra scales.
//  *
//  * @param   {string} name   Initial name of the scale; it may be renamed to
//  * prevent name collisions.
//  * @param   {string} type   Scale type (e.g., ordinal, linear, etc.).
//  * @param   {Array[]} domain An array of literal domain values
//  * @param   {Array[]|string} range  An array of literal range values, or a
//  *                                  preset range string (e.g., width, height).
//  * @returns {Object} A Lyra scale definition.
//  */
// module.exports = function(name, type, domain, range) {
//   return {
//     _origName: name,
//     name: rename(name),
//     type: type,

//     // Literal domain/ranges.
//     domain: domain,
//     range:  range,

//     // DataRefs, which get compiled from id -> json when exported.
//     _domain: [],
//     _range:  [],

//     nice: undefined,
//     round: undefined,
//     points: undefined,
//     padding: undefined
//   };
// };

export const Scale = Record<LyraScale>({
  _id: null,
  _origName: null,
  name: rename(name),
  type: null,

  domain: null,
  range: null,

  _domain: [],
  _range: [],

  nice: null,
  round: null,
  points: null,
  padding: null
});

export type ScaleRecord = RecordOf<LyraScale>;
export type ScaleState = Map<string, ScaleRecord>;
