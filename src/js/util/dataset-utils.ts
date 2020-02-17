/**
 * Exposes a number of utility functions for Datasets including loading the raw
 * values, constructing the schema, and calculating a profile. As these
 * operations are expensive, the results are memoized. However, as they can
 * always be derived from the definition of a dataset, the memoized results are
 * stored in this utility module, rather than within the redux store itself.
 *
 * @namespace dataset-utilities
 */

import {Map} from 'immutable';
import {AggregateTransform, array, Datum, Format, FormatJSON, FormatSV} from 'vega';
import {store} from '../store';
import {Column, ColumnRecord, Dataset, DatasetRecord, Schema, SourceDatasetRecord} from '../store/factory/Dataset';
import {Pipeline, PipelineRecord} from '../store/factory/Pipeline';

// Taken from vega-lite 1.0.0 src/data.js

import {NOMINAL, QUANTITATIVE, TEMPORAL} from 'vega-lite/src/type';

const MTYPES = {
  'boolean': NOMINAL,
  'number': QUANTITATIVE,
  'integer': QUANTITATIVE,
  'date': TEMPORAL,
  'string': NOMINAL
};

const dl = require('datalib');
const promisify = require('es6-promisify');
const imutils = require('./immutable-utils');
const getInVis = imutils.getInVis;

function def(id: number): DatasetRecord {
  return getInVis(store.getState(), 'datasets.' + id);
}

// tslint:disable-next-line:variable-name
let _values: {[s: string]: object[]} = {};

/**
 * Initialize a dataset by loading the raw values and constructing the schema.
 * Once this is done, an initDataset action is dispatched.
 *
 * @param  {Object} action - An ADD_DATASET action.
 * @returns {void}
 */
export function init(ds: DatasetRecord, values: object[]) {
  const id = ds._id;

  if (_values[id]) {
    // Early-exit if we've previously loaded values.
    return _values[id];
  }

  if (values) {
    _values[id] = values;
  }
  else if ((ds as SourceDatasetRecord).source !== undefined) {
    _values[id] = _values[(ds as SourceDatasetRecord).source as string];
  }
  else {
    _values[id] = null;
  }
}

export function reset() {
  _values = {};
}

export function persist(vals?: {}) {
  return arguments.length ? (_values = vals) : _values;
}

/**
 * Gets the dataset's raw input values. This is called during export because
 * raw values might be more concise than parsed values in the case of CSV/TSV.
 *
 * @param {number} id - The ID of the dataset.
 * @returns {Array|string} An array of objects.
 */
export function input(id: number): object[] {
  return _values[id] || [];
}

/**
 * Gets the dataset's output tuples (i.e., after all transformations have been
 * applied). This requires a visualization to have been parsed. If no
 * visualization has been parsed, returns the input tuples.
 *
 * @param {number} id - The ID of the dataset.
 * @returns {Object[]} An array of objects.
 */
export function output(id: number) {
  const ctrl = require('../ctrl');
  const ds = def(id);
  const data = ds && ctrl.view && ctrl.view.data(ds.name);
  return data || input(id) || [];
}

export function widgetParams(fieldDef, id: number, type) {
  const data = output(id);
  let field = data.map(e => e[fieldDef.name]);
  if(type === NOMINAL) {
    field = [...new Set(field)];
    if(field.length>50) { // What to do for very large number of options?
      return {options: field.slice(0, 50)}
    } else { return {options: field} }
  }
  field = field.sort((a,b)=> a-b);
  const length = field.length;
  return {
    max: field[length-1],
    min: field[0],
    mid: field[Math.floor(length/2)],
    quart1: field[Math.floor(length/4)],
    quart2: field[Math.floor(3*length/4)],
    length,
  }
}

export interface ParsedValues {
  format: Format,
  values: Datum[]
}

/**
 * Detects the format of a string of raw values (json, csv, tsv) and parses
 * them based on the format.
 *
 * @param   {string} raw     A string of raw values (e.g., loaded from a url).
 * @returns {ParsedValues} An object containing the format of a dataset and parsed
 *                   raw values.
 */
export function parseRaw(raw: string): ParsedValues {
  const format = {parse: 'auto', type: null};
  let parsed;

  try {
    format.type = 'json';
    return {format: format as FormatJSON, values: dl.read(raw, format)};
  } catch (error) {
    format.type = 'csv';
    parsed = dl.read(raw, format);

    // Test successful parsing of CSV/TSV data by checking # of fields found.
    // If file is TSV but was parsed as CSV, the entire header row will be
    // parsed as a single field.
    if (Object.keys(parsed[0]).length > 1) {
      return {format: format as FormatSV, values: parsed};
    }

    format.type = 'tsv';
    parsed = dl.read(raw, format);
    if (Object.keys(parsed[0]).length > 1) {
      return {format: format as FormatSV, values: parsed};
    }

    throw Error('Raw data is in an unsupported format. ' + 'Only JSON, CSV, or TSV may be imported.');
  }
}

/**
 * Returns the schema of the dataset associated with the given id
 * or processes the schema based on the dataset's actual values
 *
 * @param  {number|Array} arg - An array of raw values to calculate a schema for.
 * @returns {Object} The dataset's schema.
 */
export function schema(arg: object[]): Schema {
  if (dl.isNumber(arg)) {
    throw Error('Dataset schemas are now available in the store.');
  } else if (dl.isArray(arg)) {
    const types = dl.type.inferAll(arg);
    return dl.keys(types).reduce(function(s: Schema, k: string) {
      return s.set(k, Column({
        name: k,
        type: types[k],
        mtype: MTYPES[types[k]],
        source: true
      }));
    }, Map());
  }

  throw Error('Expected an array of raw values.');
}

/**
 * Calculates the schema for an aggregated dataset for a given source. The
 * aggregated dataset's schema contains all the groupby fields, with the same
 * definition as the source, as well as additional fields for all summarized
 * fields.
 *
 * @param   {Object} src     The source schema
 * @param   {Object} aggregate The Vega aggregate transform definition.
 * @returns {Object} The aggregate dataset's schema.
 */
export function aggregateSchema(src: Schema, aggregate: AggregateTransform): Schema {
  const groupby = (aggregate.groupby as string[]); // TODO: in vega 2, groupby is string[]. consider revisiting to avoid cast
  const aggSchema: Schema = groupby.reduce((s: Schema, gb: string) => s.set(gb, src.get(gb)), Map<string, ColumnRecord>());

  return array(aggregate.as).reduce((s: Schema, k: string) => {
    return s.set(k, Column({
      name: k,
      type: 'number',
      mtype: MTYPES.number,
      source: false
    }));
  }, aggSchema);
}

module.exports = {
  init,
  reset,
  persist,

  input,
  output,

  widgetParams,

  parseRaw,
  schema,
  aggregateSchema
};
