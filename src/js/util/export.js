'use strict';

var dl = require('datalib'),
    store = require('../store'),
    getIn = require('./immutable-utils').getIn,
    signalLookup = require('./signal-lookup'),
    dsUtils = require('./dataset-utils');

/**
 * Utility method to clean a spec object by removing Lyra-specific keys (i.e.,
 * those prefixed by an underscore).
 *
 * @param {Object} spec - A Lyra representation from the store.
 * @param {Boolean} resolve - Whether to resolve signal references to values.
 * @returns {Object} A cleaned spec object
 */
function clean(spec, resolve) {
  var key, prop, cleanKey;
  for (key in spec) {
    prop = spec[key];
    cleanKey = key.startsWith('_');
    cleanKey = cleanKey || prop._disabled || prop === undefined;
    if (cleanKey) {
      delete spec[key];
    } else if (dl.isObject(prop)) {
      if (prop.signal && resolve !== false) {
        // Render signals to their value
        spec[key] = signalLookup(prop.signal);
      } else {
        // Recurse
        spec[key] = clean(spec[key], resolve);
      }
    }
  }

  return spec;
}

function exportDataset(id, resolve) {
  var dataset = getIn(store.getState(), 'datasets.' + id).toJS(),
      spec = clean(dataset, resolve);

  // Only include the raw values in the exported spec if:
  //   1. It is a remote dataset but we're re-rendering the Lyra view
  //      (i.e., resolve === false)
  //   2. Raw values were provided by the user directly
  //      (i.e., no url or source).
  if ((spec.url && !resolve) || (!spec.url && !spec.source)) {
    spec.values = dsUtils.values(id);
    delete spec.url;
  }

  return spec;
}

function exportPipelines(resolve) {
  var pipelines = getIn(store.getState(), 'pipelines').valueSeq().toJS();
  return pipelines.map(function(pipeline) {
    return exportDataset(pipeline._source, resolve);
  });
}

module.exports = {
  exportPipelines: exportPipelines
};
