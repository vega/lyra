'use strict';

import * as dl from 'datalib';

const ns = require('./ns');

/**
 * Returns the signal name corresponding to the given mark and property.
 * @param {number} markId The Lyra ID for a given mark.
 * @param {string} markType The type of the mark (area, group, line, rect, symbol or text).
 * @param {string} property The name of the mark property determined by the signal.
 * @returns {string} The name of the signal for the given mark's property.
 */
export function propSg(markId: number, markType: string, property: string): string {
  return ns(markType + '_' + markId + '_' + property);
}

// Helper function to iterate over a mark's .encode hash and convert any .value-
// based property definitions into appropriate signal references.
// "encode" is the encode hash from the dispatched action; "type" is a string
// type; and "id" is a numeric mark ID (type and ID are used to create the name of
// the signal that will be referenced in place of values in the encode hash).
export function convertValuesToSignals(encode, type, id, propName) {
  if (!encode) {
    // No property values to initialize as signals; return encode as-is
    return encode;
  }

  // Reduce the encode into a new object with all values replaced by signal
  // references: iterate over all of the `encode.update`'s keys. For each property,
  // replace any declared .value with a signal reference pointing at the signal which
  // will represent that property (which should exist if the mark was instantiated
  // properly via the addMark store action).
  return Object.keys(encode).reduce(function(selection, key) {
    if (selection[key] === undefined || selection[key].value === undefined) {
      return selection;
    }

    // Replace `{value: '??'}` property definition with a ref to its controlling
    // signal, and ensure that _disabled flags are set properly if present
    selection[key] = dl.extend(
      {
        signal: propSg(id, type, propName ? propName + '_' + key : key)
      },
      selection[key]._disabled ? {_disabled: true} : {}
    );

    return selection;
  }, encode);
}

module.exports = propSg;
propSg.convertValuesToSignals = convertValuesToSignals;
