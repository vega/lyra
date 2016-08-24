'use strict';

var dl = require('datalib'),
    json2csv = require('json2csv'),
    store = require('../store'),
    imutils = require('../util/immutable-utils'),
    getIn = imutils.getIn,
    getInVis = imutils.getInVis,
    signalLookup = require('../util/signal-lookup'),
    dsUtils = require('../util/dataset-utils'),
    manipulators = require('./manipulators'),
    GTYPES = require('../store/factory/Guide').GTYPES,
    ORDER = require('../constants/sortOrder');

/**
 * Exports primitives in the redux store as a complete Vega specification.
 *
 * @param  {boolean} [internal=false] Should Lyra-specific properties be
 * removed (e.g., converting property signal references to actual values). When
 * true, additional mark specifications are also added corresponding to the
 * direct-manipulation interactors (handles, connectors, etc.).
 * @returns {Object} A Vega specification.
 */
function exporter(internal) {
  var state = store.getState(),
      int   = internal === true;

  var spec  = exporter.scene(state, int);
  spec.data = exporter.pipelines(state, int);
  return spec;
}

exporter.pipelines = function(state, internal) {
  var pipelines = getInVis(state, 'pipelines').valueSeq().toJS();
  return pipelines.map(function(pipeline) {

    if (pipeline._aggregates) {
      // console.log('sst');
      // console.log('pipeline: ', pipeline);
      // console.log('pipeline._aggregates: ', pipeline._aggregates);

      for (var aggregate in pipeline._aggregates) {
        if (pipeline._aggregates.hasOwnProperty(aggregate)) {
          // console.log('rtrn contents: ', exporter.dataset(state, internal, pipeline._aggregates[aggregate]));
          return exporter.dataset(state, internal, pipeline._aggregates[aggregate]);
        }
      }
    }

    // console.log('rtrn contents: ', exporter.dataset(state, internal, pipeline._source));

    return exporter.dataset(state, internal, pipeline._source);
  });
};

exporter.dataset = function(state, internal, id) {
  console.log('given id: ', id);

  var dataset = getInVis(state, 'datasets.' + id).toJS(),
      spec = clean(dl.duplicate(dataset), internal),
      values = dsUtils.input(id),
      format = spec.format && spec.format.type,
      sort = exporter.sort(dataset);

  console.log('dataset: ', dataset);
  console.log('spec: ', spec);
  console.log('format: ', format);
  console.log('values: ' + values);

  // Resolve dataset ID to name.
  // Only include the raw values in the exported spec if:
  //   1. We're re-rendering the Lyra view
  //   2. Raw values were provided by the user directly (i.e., no url/source).
  if (spec.source) {
    spec.source = name(getInVis(state, 'datasets.' + spec.source + '.name'));
  } else if (internal) {
    spec.values = values;
    delete spec.url;
    delete spec.format; // values are JSON, so do not need to be reparsed.
  } else if (!spec.url) {
    spec.values = format && format !== 'json' ?
      json2csv({data: values, del: format === 'tsv' ? '\t' : ','}) : values;
  }

  if (sort !== undefined) {
    spec.transform = spec.transform || [];
    spec.transform.push(sort);
  }

  return spec;
};

/**
  * Method that builds the vega sort data transform code from
  * the current dataset.
  *
  * @param  {object} dataset The current dataset
  * @returns {object} undefined if _sort not in dataset and the
  * vega data transform code to be appended to the vega spec to * the dataset
  */
exporter.sort = function(dataset) {
  var sort = dataset._sort;
  if (!sort) {
    return;
  }

  return {
    type: 'sort',
    by: (sort.order === ORDER.DESC ? '-' : '') + sort.field
  };
};

exporter.scene = function(state, internal) {
  var sceneId = getInVis(state, 'scene.id'),
      spec = exporter.group(state, internal, sceneId);

  if (internal) {
    spec = spec[0];
  }

  // Remove mark-specific properties that do not apply to scenes.
  delete spec.type;
  delete spec.from;
  delete spec.properties;

  return spec;
};

exporter.mark = function(state, internal, id) {
  var mark = getInVis(state, 'marks.' + id).toJS(),
      spec = clean(dl.duplicate(mark), internal),
      up = mark.properties.update,
      upspec = spec.properties.update,
      fromId;

  if (spec.from) {
    if ((fromId = spec.from.data)) {
      spec.from.data = name(getInVis(state, 'datasets.' + fromId + '.name'));
    } else if ((fromId = spec.from.mark)) {
      spec.from.mark = name(getInVis(state, 'marks.' + fromId + '.name'));
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
      specVal.scale = name(getInVis(state, 'scales.' + origVal.scale + '.name'));
    }

    if (origVal.group) {
      specVal.field = {group: origVal.group};
      delete specVal.group;
    }
  });

  if (internal) {
    spec.lyra_id = mark._id;
    return manipulators(mark, spec);
  }

  return spec;
};

exporter.group = function(state, internal, id) {
  var mark = getInVis(state, 'marks.' + id).toJS(),
      spec = exporter.mark(state, internal, id),
      group = internal ? spec[0] : spec;

  ['scale', 'mark', 'axe', 'legend'].forEach(function(childType) {
    var childTypes = childType + 's', // Pluralized for spec key.
        storePath  = childTypes === 'axes' || childTypes === 'legends' ?
          'guides' : childTypes;

    // Route export to the most appropriate function.
    group[childTypes] = mark[childTypes].map(function(cid) {
      if (getInVis(state, storePath + '.' + cid)) {
        var child = getInVis(state, storePath + '.' + cid).toJS();

        if (exporter[child.type]) {
          return exporter[child.type](state, internal, cid);
        } else if (exporter[childType]) {
          return exporter[childType](state, internal, cid);
        }

        return clean(dl.duplicate(child), internal);
      }
    }).reduce(function(children, child) {
      // If internal === true, children are an array of arrays which must be flattened.
      if (dl.isArray(child)) {
        children.push.apply(children, child);
      } else {
        children.push(child);
      }
      return children;
    }, []);
  });

  return spec;
};

exporter.area = function(state, internal, id) {
  var spec = exporter.mark(state, internal, id),
      area = internal ? spec[0] : spec,
      update = area.properties.update;

  // Export with dummy data to have an initial area appear on the canvas.
  if (!area.from) {
    area.from = {data: 'dummy_data_area'};
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

exporter.line = function(state, internal, id) {
  var spec = exporter.mark(state, internal, id),
      line = internal ? spec[0] : spec,
      update = line.properties.update;

  // Export with dummy data to have an initial area appear on the canvas.
  if (!line.from) {
    line.from = {data: 'dummy_data_line'};
    update.x = {field: 'foo'};
    update.y = {field: 'bar'};
  }

  return spec;
};

exporter.scale = function(state, internal, id) {
  var scale = getInVis(state, 'scales.' + id).toJS(),
      spec  = clean(dl.duplicate(scale), internal);

  if (!scale.domain && scale._domain && scale._domain.length) {
    spec.domain = dataRef(state, scale, scale._domain);
  }

  if (!scale.range && scale._range && scale._range.length) {
    spec.range = dataRef(state, scale, scale._range);
  }

  // TODO: Sorting multiple datasets?
  var sortOrder = dl.isObject(spec.domain) && spec.domain._sortOrder;
  if (sortOrder) {
    spec.reverse = sortOrder === ORDER.DESC ? !spec.reverse : !!spec.reserve;
  }

  return spec;
};

exporter.axe = exporter.legend = function(state, internal, id) {
  var guide = getInVis(state, 'guides.' + id).toJS(),
      spec  = clean(dl.duplicate(guide), internal),
      gtype = guide._gtype,
      type  = guide._type;

  if (gtype === GTYPES.AXIS) {
    spec.scale = name(getInVis(state, 'scales.' + spec.scale + '.name'));
  } else if (gtype === GTYPES.LEGEND) {
    spec[type] = name(getInVis(state, 'scales.' + spec[type] + '.name'));
  }

  dl.keys(spec.properties).forEach(function(prop) {
    var def = spec.properties[prop];
    dl.keys(def).forEach(function(key) {
      if (!dl.isObject(def[key])) {  // signalRef resolved to literal
        def[key] = {value: def[key]};
      }
    });
  });

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
 * @param {Boolean} internal - Whether to resolve signal references to values.
 * @returns {Object} A cleaned spec object
 */
function clean(spec, internal) {
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
      if (prop.signal && internal === false) {
        // Render signals to their value
        spec[key] = signalLookup(prop.signal);
      } else {
        // Recurse
        spec[key] = clean(spec[key], internal);
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
 * @param  {Object} scale The definition of the scale.
 * @param  {Array}  ref   Array of fields
 * @returns {Object} A Vega DataRef
 */
function dataRef(state, scale, ref) {
  var sets = {},
      data, did, field, i, len, keys;

  // One ref
  if (ref.length === 1) {
    ref = ref[0];
    data = getInVis(state, 'datasets.' + ref.data);
    return sortDataRef(data, scale, {
      data:  name(data.get('name')),
      field: ref.field
    });
  }

  // More than one ref
  for (i = 0, len = ref.length; i < len; ++i) {
    data = getInVis(state, 'datasets.' + ref[i].data);
    field = ref[i].field;
    sets[did = data.get('_id')] = sets[did] || (sets[did] = []);
    sets[did].push(field);
  }

  keys = dl.keys(sets);
  if (keys.length === 1) {
    return sortDataRef(data, scale, {
      data:  name(data.get('name')),
      field: sets[did]
    });
  }

  ref = {fields: []};
  for (i = 0, len = keys.length; i < len; ++i) {
    data = getInVis(state, 'datasets.' + keys[i]);
    ref.fields.push(sortDataRef(data, scale, {
      data:  name(data.get('name')),
      field: sets[keys[i]]
    }));
  }

  return ref;
}

function sortDataRef(data, scale, ref) {
  if (scale.type === 'ordinal' && data.get('_sort')) {
    var sortField = getIn(data, '_sort.field');
    return dl.extend(ref, {
      sort: sortField === ref.field ? true :
        {field: sortField, op: 'min'},
      _sortOrder: getIn(data, '_sort.order')
    });
  }

  return ref;
}

module.exports = exporter;
module.exports.exportName = name;
