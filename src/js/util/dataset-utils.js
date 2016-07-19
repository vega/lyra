'use strict';

var dl = require('datalib'),
    vl = require('vega-lite'),
    promisify = require('es6-promisify'),
    immutableUtils = require('./immutable-utils'),
    getIn = immutableUtils.getIn,
    initDataset = require('../actions/datasetActions').initDataset,
    MTYPES = vl.data.types;

// Circumvents the circular dependency
function store() {
  return require('../store');
}

function def(id) {
  return getIn(store().getState(), 'datasets.' + id).toJS();
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
var du = {},
    values = {},
    schema = {};

/**
 * Initialize a dataset by loading the raw values and constructing the schema.
 * Once this is done, an initDataset action is dispatched.
 *
 * @param  {Object} action - An ADD_DATASET action.
 * @returns {Promise} A promise that is resolved once the data has been loaded.
 */
du.init = function(action) {
  var id  = action.id,
      ds  = action.props,
      fmt = ds.format;

  if (values[id]) { // Early-exit if we've previously loaded values.
    return Promise.resolve(values[id]);
  }

  return new Promise(function(resolve, reject) {
    if (ds.source) {
      resolve((values[id] = values[ds.source]));
    } else if (action.values) {

      /*
        Prior to changes:
        resolve((values[id] = dl.read(action.values, fmt)));

        Using dl.read with fmt when read csv or tsv causes already
        read objects to be encapsulated in `columns` property.
      */
      var fmtType = fmt.type;

      if (fmtType === 'csv' || fmtType === 'tsv' || fmtType === 'json') {
        resolve((values[id] = action.values));
      } else {

        /*
          Prior code assumes `action.values` will be raw.
          However, sometimes values are read via dl.read before
          this block eg. PipelineModal:handleSubmit or
          PipelineModal:cpChangeHandler
        */
        resolve((values[id] = dl.read(action.values, fmt)));
      }
    } else if (ds.url) {
      resolve(
        promisify(dl.load)({url: ds.url}).then(function(data) {
          return (values[id] = dl.read(data, fmt));
        })
      );
    }
  }).then(function() {
    du.schema(id);
    store().dispatch(initDataset(id));
  });
};

/**
 * Gets the dataset's output tuples (i.e., after all transformations have been
 * applied). This requires a visualization to have been parsed. If no
 * visualization has been parsed, returns the input tuples.
 *
 * @param {number} id - The ID of the dataset.
 * @returns {Object[]} An array of objects.
 */
du.values = function(id) {
  var ctrl = require('../ctrl'),
      ds = ctrl.view && ctrl.view.data(def(id).name);

  return ds ? ds.values() : values[id];
};

/**
 * Constructs the schema of the given dataset -- an object where keys correspond
 * to the names of the dataset's fields, and the values are field primitives.
 *
 * @param  {number} id - The ID of the dataset.
 * @returns {Object} The dataset's schema.
 */
du.schema = function(id) {
  if (schema[id]) {
    return schema[id];
  }

  var types  = dl.type.inferAll(du.values(id));
  schema[id] = dl.keys(types).reduce(function(s, k) {
    // TODO: Refactor out to a Field class?
    s[k] = {
      name:  k,
      type:  types[k],  // boolean, number, string, etc.
      mtype: MTYPES[types[k]] // nominal, ordinal, quantitative, temporal, etc.
    };
    return s;
  }, {});

};

du.reset = function() {
  du = {};
  values = {};
  schema = {};
};

du.MTYPES = ['nominal', 'quantitative', 'temporal']; // ordinal not yet used

module.exports = du;
