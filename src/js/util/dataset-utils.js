'use strict';

var dl = require('datalib'),
    promisify = require('es6-promisify'),
    MTYPES = require('vega-lite').data.types,
    imutils = require('./immutable-utils'),
    getInVis = imutils.getInVis,
    NAME_REGEX = /([\w\d_-]*)\.?[^\\\/]*$/i;

// Circumvents the circular dependency
function store() {
  return require('../store');
}

function def(id) {
  return getInVis(store().getState(), 'datasets.' + id);
}

/**
 * Exposes a number of utility functions for Datasets including loading the raw
 * values, constructing the schema, and calculating a profile. As these
 * operations are expensive, the results are memoized. However, as they can
 * always be derived from the definition of a dataset, the memoized results are
 * stored in this utility module, rather than within the redux store itself.
 *
 * @namespace dataset-utilities
 */
var _values = {},
    _schema = {};

/**
 * Initialize a dataset by loading the raw values and constructing the schema.
 * Once this is done, an initDataset action is dispatched.
 *
 * @param  {Object} action - An ADD_DATASET action.
 * @returns {void}
 */
function init(action) {
  var id = action.id,
      props = action.props,
      src = props.source;

  if (_values[id]) { // Early-exit if we've previously loaded values.
    return _values[id];
  }

  _values[id] = action.values || (src ? _values[src] : null);
  _schema[id] = action.schema || (src ? _schema[src] : null);
}

function reset() {
  _values = {};
  _schema = {};
}

/**
 * Gets the dataset's raw input values. This is called during export because
 * raw values might be more concise than parsed values in the case of CSV/TSV.
 *
 * @param {number} id - The ID of the dataset.
 * @returns {Array|string} An array of objects.
 */
function input(id) {
  return _values[id];
}

/**
 * Gets the dataset's output tuples (i.e., after all transformations have been
 * applied). This requires a visualization to have been parsed. If no
 * visualization has been parsed, returns the input tuples.
 *
 * @param {number} id - The ID of the dataset.
 * @returns {Object[]} An array of objects.
 */
function output(id) {
  var ctrl = require('../ctrl'),
      ds = def(id),
      view = ds && ctrl.view && ctrl.view.data(ds.get('name'));

  // proposed change: ensure ds.values() return contents isnt empty
  return (view && view.values().length) ? view.values() : input(id);
}

/**
 * Load raw values from a URL.
 *
 * @param   {string} url      The URL to load.
 * @param   {Object} [pipeline] The definition for a pipeline (e.g., w/name).
 * @param   {Object} dataset  The definition for a dataset (e.g., name, url).
 * @returns {Object} An object containing the loaded values.
 */
function loadURL(url) {
  var fileName = url.match(NAME_REGEX)[1],
      pipeline = {name: fileName},
      dataset  = {name: fileName, url: url};

  return promisify(dl.load)({url: url})
    .then(function(data) {
      return {data: data, pipeline: pipeline, dataset: dataset};
    });
}

/**
 * Detects the format of a string of raw values (json, csv, tsv) and parses
 * them based on the format.
 *
 * @param   {string} raw     A string of raw values (e.g., loaded from a url).
 * @returns {Object} An object containing the format of a dataset and parsed
 *                   raw values.
 */
function parseRaw(raw) {
  var format = {parse: 'auto'},
      parsed;

  try {
    format.type = 'json';
    return {format: format, values: dl.read(raw, format)};
  } catch (error) {
    format.type = 'csv';
    parsed = dl.read(raw, format);

    // Test successful parsing of CSV/TSV data by checking # of fields found.
    // If file is TSV but was parsed as CSV, the entire header row will be
    // parsed as a single field.
    if (dl.keys(parsed[0]).length > 1) {
      return {format: format, values: parsed};
    }

    format.type = 'tsv';
    parsed = dl.read(raw, format);
    if (dl.keys(parsed[0]).length > 1) {
      return {format: format, values: parsed};
    }

    throw Error('Raw data is in an unsupported format. ' +
      'Only JSON, CSV, or TSV may be imported.');
  }

  return {};
}

/**
 * Returns the schema of the dataset associated with the given id
 * or processes the schema based on the dataset's actual values
 *
 * @param  {number|Array} arg - The ID of the dataset whose schema to return, or
 * an array of raw values to calculate a schema for.
 * @returns {Object} The dataset's schema.
 */
function schema(arg) {
  if (dl.isNumber(arg)) {
    return _schema[arg];
  } else if (dl.isArray(arg)) {
    var types = dl.type.inferAll(arg);
    return dl.keys(types).reduce(function(s, k) {
      s[k] = {
        name: k,
        type: types[k],
        mtype: MTYPES[types[k]]
      };
      return s;
    }, {});
  }

  throw Error('Expected either a dataset ID or raw values array');
}

/**
 * Calculates the schema for an aggregated dataset for a given source. The
 * aggregated dataset's schema contains all the groupby fields, with the same
 * definition as the source, as well as additional fields for all summarized
 * fields.
 *
 * @param   {number} srcId     The ID of the source dataset.
 * @param   {Object} aggregate The Vega aggregate transform definition.
 * @returns {Object} The aggregate dataset's schema.
 */
function aggregateSchema(srcId, aggregate) {
  var src = schema(srcId),
      aggSchema = aggregate.groupby.reduce(function(acc, gb) {
        return (acc[gb] = src[gb], acc);
      }, {}),
      summarize = aggregate.summarize,
      field, i, len, name;

  for (field in summarize) {
    for (i = 0, len = summarize[field].length; i < len; ++i) {
      name = summarize[field][i] + '_' + field;
      aggSchema[name] = {
        name: name,
        type: 'number',
        mtype: MTYPES.number
      };
    }
  }

  return aggSchema;
}

module.exports = {
  init: init,
  reset: reset,

  input: input,
  output: output,

  loadURL: loadURL,
  parseRaw: parseRaw,
  schema: schema,
  aggregateSchema: aggregateSchema,

  NAME_REGEX: NAME_REGEX
};
