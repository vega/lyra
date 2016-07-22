'use strict';

var dl = require('datalib'),
    vl = require('vega-lite'),
    imutils = require('./immutable-utils'),
    getIn = imutils.getIn,
    getInVis = imutils.getInVis,
    MTYPES = vl.data.types;

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
var _raw = {},
    _values = {},
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
      src = props.source,
      format = props.format,
      type = format && format.type;

  if (_values[id]) { // Early-exit if we've previously loaded values.
    return _values[id];
  }

  if (src) {
    _raw[id] = _raw[src];
    _values[id] = _values[src];
  } else {
    if (type && type !== 'json') {
      _raw[id] = action.rawVals;
    }

    _values[id] = action.parsedVals;
  }

  schema(id);
}

/**
 * Gets the dataset's raw input values. This is called during export because
 * raw values might be more concise than parsed values in the case of CSV/TSV.
 *
 * @param {number} id - The ID of the dataset.
 * @returns {Array|string} An array of objects.
 */
function raw(id) {
  var ds = def(id),
      format = getIn(ds, 'format.type');

  return format && format !== 'json' ? _raw[id] : _values[id];
}

/**
 * Gets the dataset's output tuples (i.e., after all transformations have been
 * applied). This requires a visualization to have been parsed. If no
 * visualization has been parsed, returns the input tuples.
 *
 * @param {number} id - The ID of the dataset.
 * @returns {Object[]} An array of objects.
 */
function values(id) {
  var ctrl = require('../ctrl'),
      ds = def(id),
      view = ds && ctrl.view && ctrl.view.data(ds.get('name'));

  // proposed change: ensure ds.values() return contents isnt empty
  return (view && view.values().length) ? view.values() : _values[id];
}

/**
 * Constructs the schema of the given dataset -- an object where keys correspond
 * to the names of the dataset's fields, and the values are field primitives.
 *
 * @param  {number} id - The ID of the dataset.
 * @returns {Object} The dataset's schema.
 */
function schema(id) {
  if (_schema[id]) {
    return _schema[id];
  }

  var types  = dl.type.inferAll(values(id));
  _schema[id] = dl.keys(types).reduce(function(s, k) {
    // TODO: Refactor out to a Field class?
    s[k] = {
      name:  k,
      type:  types[k],  // boolean, number, string, etc.
      mtype: MTYPES[types[k]] // nominal, ordinal, quantitative, temporal, etc.
    };
    return s;
  }, {});

}

function reset() {
  _raw = {};
  _values = {};
  _schema = {};
}

module.exports = {
  init: init,
  raw: raw,
  values: values,
  schema: schema,
  reset: reset,
  MTYPES: ['nominal', 'quantitative', 'temporal'], // ordinal not yet used
};
