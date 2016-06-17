'use strict';

var dl = require('datalib'),
    store = require('../store'),
    getIn = require('../util/immutable-utils').getIn,
    signalLookup = require('../util/signal-lookup'),
    dsUtils = require('../util/dataset-utils');

/**
 * Exports primitives in the redux store as a complete Vega specification.
 *
 * @param  {Object} [scene] An exported specification of the scene.
 * @param  {boolean} [shouldClean=true] Should Lyra-specific properties be
 * removed (e.g., converting property signal references to actual values).
 * @returns {Object} A Vega specification.
 */
function exporter(scene, shouldClean) {
  var state = store.getState(),
      resolve = shouldClean || shouldClean === undefined,
      spec = scene || exporter.scene(state, resolve);

  spec.data = exporter.pipelines(state, resolve);
  return spec;
}

exporter.pipelines = function(state, resolve) {
  var pipelines = getIn(state, 'pipelines').valueSeq().toJS();
  return pipelines.map(function(pipeline) {
    return exporter.dataset(state, resolve, pipeline._source);
  });
};

exporter.dataset = function(state, resolve, id) {
  var dataset = getIn(state, 'datasets.' + id).toJS(),
      spec = clean(dl.duplicate(dataset), resolve);

  // Only include the raw values in the exported spec if:
  //   1. It is a remote dataset but we're re-rendering the Lyra view
  //      (i.e., resolve === false)
  //   2. Raw values were provided by the user directly
  //      (i.e., no url or source).
  if ((spec.url && !resolve) || (!spec.url && !spec.source)) {
    spec.values = dsUtils.values(id);
    delete spec.url;
  }

  // Resolve dataset ID to name.
  if (spec.source) {
    spec.source = name(getIn(state, 'datasets.' + spec.source + '.name'));
  }

  return spec;
};

exporter.scene = function(state, resolve) {
  var sceneId = getIn(state, 'scene.id'),
      spec = exporter.group(state, resolve, sceneId);

  /* eslint no-multi-spaces:0 */
  // Always resolve width/height signals.
  spec.width  = spec.width.signal  ? signalLookup(spec.width.signal)  : spec.width;
  spec.height = spec.height.signal ? signalLookup(spec.height.signal) : spec.height;

  // Remove mark-specific properties that do not apply to scenes.
  delete spec.type;
  delete spec.from;
  delete spec.properties;

  return spec;
};

exporter.mark = function(state, resolve, id) {
  var mark = getIn(state, 'marks.' + id).toJS(),
      spec = clean(dl.duplicate(mark), resolve),
      up = mark.properties.update,
      upspec = spec.properties.update,
      fromId;

  if (spec.from) {
    if ((fromId = spec.from.data)) {
      spec.from.data = name(getIn(state, 'datasets.' + fromId + '.name'));
    } else if ((fromId = spec.from.mark)) {
      spec.from.mark = name(getIn(state, 'marks.' + fromId + '.name'));
    }
  }

  dl.keys(upspec).forEach(function(key) {
    var specVal = upspec[key],
        origVal = up[key];

    if (!dl.isObject(specVal)) {  // signalRef resolved to literal
      specVal = upspec[key] = {value: specVal};
    }

    // Use the origVal to determine if scale/fields have been set in case
    // specVal was replaced above (e.g., scale + signal).
    if (origVal.scale) {
      specVal.scale = name(getIn(state, 'scales.' + origVal.scale + '.name'));
    }

    if (origVal.group) {
      specVal.field = {group: origVal.group};
      delete specVal.group;
    }
  });

  if (!resolve) {
    spec.lyra_id = mark._id;
  }

  return spec;
};

exporter.group = function(state, resolve, id) {
  var mark = getIn(state, 'marks.' + id).toJS(),
      spec = exporter.mark(state, resolve, id);

  // TODO: axes and legends.
  ['scale', 'mark'].forEach(function(childType) {
    var childTypes = childType + 's'; // Pluralized for spec key.

    // Route export to the most appropriate function.
    spec[childTypes] = mark[childTypes].map(function(cid) {
      var child = getIn(state, childTypes + '.' + cid).toJS();
      if (exporter[child.type]) {
        return exporter[child.type](state, resolve, cid);
      } else if (exporter[childType]) {
        return exporter[childType](state, resolve, cid);
      }

      return clean(dl.duplicate(child), resolve);
    });
  });

  return spec;
};

exporter.area = function(state, resolve, id) {
  var spec = exporter.mark(state, resolve, id),
      update = spec.properties.update;

  // Export with dummy data to have an initial area appear on the canvas.
  if (!spec.from) {
    spec.from = {data: 'dummy_data_area'};
    update.x = {field: 'x'};
    update.y = {field: 'y'};
  }

  if (update.orient.value === 'horizontal') {
    delete update.y2;
  } else {
    delete update.x2;
  }

  return spec;
};

exporter.line = function(state, resolve, id) {
  var spec = exporter.mark(state, resolve, id),
      update = spec.properties.update;

  // Export with dummy data to have an initial area appear on the canvas.
  if (!spec.from) {
    spec.from = {data: 'dummy_data_line'};
    update.x = {field: 'foo'};
    update.y = {field: 'bar'};
  }

  return spec;
};

exporter.scale = function(state, resolve, id) {
  var scale = getIn(state, 'scales.' + id).toJS(),
      spec  = clean(dl.duplicate(scale), resolve);

  if (!scale.domain && scale._domain && scale._domain.length) {
    spec.domain = dataRef(state, scale._domain);
  }

  if (!scale.range && scale._range && scale._range.length) {
    spec.range = dataRef(state, scale._range);
  }

  return spec;
};

/**
 * Utility method that ensures names delimit spaces.
 *
 * @param  {string} str The name of a primitive that may contain spaces
 * @returns {string} The name, where spaces are replaced with underscores.
 */
function name(str) {
  return str.replace(/\s/g, '_');
}

/**
 * Utility method to clean a spec object by removing Lyra-specific keys
 * (i.e., those prefixed by an underscore).
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
    } else if (key === 'name' && dl.isString(prop)) {
      spec[key] = name(prop);
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

/**
 * Utility method to export a list of fields to DataRefs. We don't default to
 * the last option, as the structure has performance implications in Vega.
 * Most to least performant:
 *   {"data": ..., "field": ...} for a single field
 *   {"data": ..., "field": [...]} for multiple fields from the same dataset.
 *   {"fields": [...]} for multiple fields from distinct datasets
 *
 * @param  {object} state Redux state
 * @param  {Array}  ref   Array of fields
 * @returns {Object} A Vega DataRef
 */
function dataRef(state, ref) {
  var sets = {},
      data, did, field, i, len, keys;

  // One ref
  if (ref.length === 1) {
    ref = ref[0];
    return {
      data:  name(getIn(state, 'datasets.' + ref.data + '.name')),
      field: ref.field
    };
  }

  // More than one ref
  for (i = 0, len = ref.length; i < len; ++i) {
    data  = getIn(state, 'datasets.' + ref[i].data);
    field = ref[i].field;
    sets[did = data.get('_id')] = sets[did] || (sets[did] = []);
    sets[did].push(field);
  }

  keys = dl.keys(sets);
  if (keys.length === 1) {
    return {
      data:  name(data.get('name')),
      field: sets[did]
    };
  }

  ref = {fields: []};
  for (i = 0, len = keys.length; i < len; ++i) {
    ref.fields.push({
      data:  name(getIn(state, 'datasets.' + keys[i] + '.name')),
      field: sets[keys[i]]
    });
  }

  return ref;
}

module.exports = exporter;
