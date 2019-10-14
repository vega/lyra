import {extend, isArray, isObject, isString, Mark, Spec} from 'vega';
import MARK_EXTENTS from '../constants/markExtents';
import {State, store} from '../store';
import {GuideType} from '../store/factory/Guide';
import {InteractionRecord} from '../store/factory/Interaction';
import {GroupRecord} from '../store/factory/marks/Group';
import {input} from '../util/dataset-utils';
import duplicate from '../util/duplicate';
import name from '../util/exportName';
import {signalLookup} from '../util/signal-lookup';
import manipulators from './manipulators';
import demonstrations, {intervalPreviewDefs, pointPreviewDefs, mappingPreviewDefs, editSignals} from './demonstrations';

const json2csv = require('json2csv'),
  imutils = require('../util/immutable-utils'),
  getIn = imutils.getIn,
  getInVis = imutils.getInVis,
  ORDER = require('../constants/sortOrder');

const SPEC_COUNT = {data: {}, scales: {}, _totaled: false},
  DATA_COUNT = {marks: {}, scales: {}},
  SCALE_COUNT = {marks: {}, guides: {}};

// How many times data sources and scales have been used.
let counts = duplicate(SPEC_COUNT);

/**
 * Exports primitives in the redux store as a complete Vega specification.
 *
 * @param  {boolean} [internal=false] Should Lyra-specific properties be
 * removed (e.g., converting property signal references to actual values). When
 * true, additional mark specifications are also added corresponding to the
 * direct-manipulation interactors (handles, connectors, etc.).
 * @param  {boolean} [preview=false] Should interaction definitions be removed
 * (so that they can be overwritten to display interaction previews).
 * @returns {Object} A Vega specification.
 */
export function exporter(internal: boolean = false, preview: boolean = false): Spec {
  const state = store.getState();
  const int = internal === true;
  const prev = preview === true;

  counts = duplicate(SPEC_COUNT);

  const spec: Spec = exporter.scene(state, int, prev);
  spec.data = exporter.pipelines(state, int, prev);
  // spec.background = 'white';
  console.log(spec);
  return spec;
}

exporter.pipelines = function(state: State, internal: boolean, preview: boolean) {
  const pipelines = getInVis(state, 'pipelines')
    .valueSeq()
    .toJS();
  return pipelines.reduce(function(spec, pipeline) {
    spec.push(exporter.dataset(state, internal, preview, pipeline._source));

    const aggrs = pipeline._aggregates;
    for (const key in aggrs) {
      spec.push(exporter.dataset(state, internal, preview, aggrs[key]));
    }
    return spec;
  }, []);
};

exporter.dataset = function(state: State, internal: boolean, preview: boolean, id: number) {
  const dataset = getInVis(state, 'datasets.' + id).toJS(),
    spec = clean(duplicate(dataset), internal),
    values = input(id),
    format = spec.format && spec.format.type,
    sort = exporter.sort(dataset);

  counts.data[id] = counts.data[id] || duplicate(DATA_COUNT);

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
    spec.values = format && format !== 'json' ? json2csv({data: values, del: format === 'tsv' ? '\t' : ','}) : values;
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
  const sort = dataset._sort;
  if (!sort) {
    return;
  }

  return {
    type: 'sort',
    by: (sort.order === ORDER.DESC ? '-' : '') + sort.field
  };
};

exporter.scene = function(state: State, internal: boolean, preview: boolean): Mark {
  const sceneId = state.getIn(['vis', 'present', 'scene', '_id']);
  let spec = exporter.group(state, internal, preview, sceneId);

  if (internal) {
    spec = spec[0];
  }

  // Remove mark-specific properties that do not apply to scenes.
  // delete spec.type;
  delete spec.from;
  delete spec.encode;

  return spec;
};

exporter.mark = function(state: State, internal: boolean, preview: boolean, id: number) {
  const mark = getInVis(state, 'marks.' + id).toJS(),
    spec = clean(duplicate(mark), internal),
    up = mark.encode.update,
    upspec = spec.encode.update;
  let fromId, count;

  if (spec.from) {
    if ((fromId = spec.from.data)) {
      spec.from.data = name(getInVis(state, 'datasets.' + fromId + '.name'));
      count = counts.data[fromId] || (counts.data[fromId] = duplicate(DATA_COUNT));
      count.marks[id] = true;
    } else if ((fromId = spec.from.mark)) {
      spec.from.mark = name(getInVis(state, 'marks.' + fromId + '.name'));
    }
  }

  Object.keys(upspec).forEach(function(key) {
    let specVal = upspec[key],
      origVal = up[key],
      origScale = origVal.scale;

    if (!isObject(specVal)) {
      // signalRef resolved to literal
      specVal = upspec[key] = {value: specVal};
    }

    // Use the origVal to determine if scale/fields have been set in case
    // specVal was replaced above (e.g., scale + signal).
    if (origScale) {
      specVal.scale = name(getInVis(state, 'scales.' + origScale + '.name'));
      count = counts.scales[origScale] || (counts.scales[origScale] = duplicate(SCALE_COUNT));
      count.marks[id] = true;
    }

    if (origVal.group) {
      specVal.field = {group: origVal.group};
      delete specVal.group;
    }
  });

  // Convert text template strings into signal expressions.
  if (spec.type === 'text') {
    let tmpl = spec.encode.update.text.signal;
    tmpl = tmpl.split(RegExp('{{(.*?)}}')).map(s => {
      return s.indexOf('datum') < 0 ? `"${s}"` : `+ ${s} + `
    }).join('');
    spec.encode.update.text.signal = tmpl;
  }

  if (internal) {
    spec.role = `lyra_${mark._id}`;
    return manipulators(mark, spec);
  }

  return spec;
};

exporter.group = function(state: State, internal: boolean, preview: boolean, id: number) {
  const mark: GroupRecord = getInVis(state, `marks.${id}`),
    spec = exporter.mark(state, internal, preview, id),
    group = internal ? spec[0] : spec;

  ['scale', 'mark', 'axe', 'legend'].forEach(function(childType) {
    const childTypes = childType + 's', // Pluralized for spec key.
      storePath = childTypes === 'axes' || childTypes === 'legends' ? 'guides' : childTypes;

    // Route export to the most appropriate function.
    group[childTypes] = mark[childTypes]
      .map(cid => {
        const child = getInVis(state, `${storePath}.${cid}`);
        return !child ? null :
          exporter[child.type] ? exporter[child.type](state, internal, preview, cid) :
          exporter[childType]  ? exporter[childType](state, internal, preview, cid) :
          clean(duplicate(child.toJS()), internal);
      })
      .reduce((children, child) => {
        // If internal === true, children are an array of arrays which must be flattened.
        if (isArray(child)) {
          children.push.apply(children, child);
        } else if (child) {
          children.push(child);
        }
        return children;
      }, []);
  });

  if (mark.name !== 'Scene') {
    // Add width/height signals so that nested scales span correctly.
    group.signals = group.signals || [];
    group.signals.push(
      {name: 'width', value: groupSize(mark, 'x')},
      {name: 'height', value: groupSize(mark, 'y')},
    );
    // Add demonstrations
    demonstrations(group, state);
    // Add interaction signals
    if (!preview) {
      const interactions = mark._interactions;
      console.log('not preview ', interactions);
      if (interactions) {
        interactions.forEach((interactionId: number) => {
          const interaction: InteractionRecord = state.getIn(['vis', 'present', 'interactions', String(interactionId)]);
          const interactionType = interaction.get('interactionType');
          const mappingType = interaction.get('mappingType');
          console.log('an interaction ', interactionType, mappingType);
          if (interactionType) {
            const intervalMatches = intervalPreviewDefs.filter((def) => def.id === interactionType);
            const isDemonstratingInterval = intervalMatches.length > 0;
            if (isDemonstratingInterval) {
              group.signals = editSignals(group.signals, intervalMatches[0].signals);
              // group.signals = group.signals.concat(intervalMatches[0].signals);
              console.log('pushed signals ', intervalMatches[0].signals);
            }
            else {
              const pointMatches = pointPreviewDefs.filter((def) => def.id === interactionType);
              if (pointMatches.length) {
                group.signals = editSignals(group.signals, pointMatches[0].signals);
                // group.signals = group.signals.concat(pointMatches[0].signals);
                console.log('pushed signals ', pointMatches[0].signals);
              }
            }
            if (mappingType) {
              const mappingDefs = mappingPreviewDefs(isDemonstratingInterval);
              const mappingMatches = mappingDefs.filter((def) => def.id === mappingType);
              if (mappingMatches.length) {
                // TODO(jzong): have to find the correct mark inside of this group, and apply the properties
                // mappingMatches[0].properties
              }
            }
          }
        });
        console.log(group.signals);
      }
    }
  }

  return spec;
};

exporter.area = function(state: State, internal: boolean, preview: boolean, id: number) {
  const spec = exporter.mark(state, internal, preview, id),
    area = internal ? spec[0] : spec,
    update = area.encode.update;

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

exporter.line = function(state: State, internal: boolean, preview: boolean, id: number) {
  const spec = exporter.mark(state, internal, preview, id),
    line = internal ? spec[0] : spec,
    update = line.encode.update;

  // Export with dummy data to have an initial area appear on the canvas.
  if (!line.from) {
    line.from = {data: 'dummy_data_line'};
    update.x = {field: 'foo'};
    update.y = {field: 'bar'};
  }

  return spec;
};

exporter.scale = function(state: State, internal: boolean, preview: boolean, id: number) {
  const scale = getInVis(state, 'scales.' + id).toJS(),
    spec = clean(duplicate(scale), internal);

  counts.scales[id] = counts.scales[id] || duplicate(SCALE_COUNT);

  if (!scale.domain && scale._domain && scale._domain.length) {
    spec.domain = dataRef(state, scale, scale._domain);
  }

  if (!scale.range && scale._range && scale._range.length) {
    spec.range = dataRef(state, scale, scale._range);
  }

  // TODO: Sorting multiple datasets?
  const sortOrder = isObject(spec.domain) && spec.domain._sortOrder;
  if (sortOrder) {
    spec.reverse = sortOrder === ORDER.DESC ? !spec.reverse : !!spec.reserve;
  }

  return spec;
};

exporter.axe = exporter.legend = function(state: State, internal: boolean, preview: boolean, id: number) {
  const guide = getInVis(state, 'guides.' + id).toJS(),
    spec = clean(duplicate(guide), internal),
    gtype = guide._gtype,
    type = guide._type;

  if (gtype === GuideType.Axis) {
    counts.scales[spec.scale].guides[id] = true;
    spec.scale = name(getInVis(state, 'scales.' + spec.scale + '.name'));
  } else if (gtype === GuideType.Legend) {
    counts.scales[spec[type]].guides[id] = true;
    spec[type] = name(getInVis(state, 'scales.' + spec[type] + '.name'));
  }

  Object.keys(spec.encode).forEach(function(prop) {
    const def = spec.encode[prop];
    Object.keys(def).forEach(function(key) {
      if (!isObject(def[key])) {
        // signalRef resolved to literal
        def[key] = {value: def[key]};
      }
    });
  });

  return spec;
};

function groupSize(group, dimension: 'x' | 'y') {
  const update = group.encode.update,
    extents = MARK_EXTENTS[dimension];

  // TODO: If these properties are scale bound.
  if (!update[extents.SPAN.name]._disabled) {
    return signalLookup(update[extents.SPAN.name].signal);
  }
}

/**
 * Utility method to clean a spec object by removing Lyra-specific keys
 * (i.e., those prefixed by an underscore).
 *
 * @param {Object} spec - A Lyra representation from the store.
 * @param {Boolean} internal - Whether to resolve signal references to values.
 * @returns {Object} A cleaned spec object
 */
function clean(spec, internal: boolean) {
  let cleanKey;
  for (const [key, prop] of Object.entries(spec)) {
    cleanKey = key.startsWith('_');
    cleanKey = cleanKey || prop === null || prop === undefined || (prop as any)._disabled;
    if (cleanKey) {
      delete spec[key];
    } else if (key === 'name' && isString(prop)) {
      spec[key] = name(prop);
    } else if (isObject(prop)) {
      if ((prop as any).signal && !internal) {
        // Render signals to their value
        spec[key] = signalLookup((prop as any).signal);
      } else {
        // Recurse
        spec[key] = clean(spec[key], internal);
      }
    }
  }

  return spec;
}

export function getCounts(recount: boolean) {
  let key, entry;
  if (recount) {
    exporter();
  } else if (counts._totaled) {
    return counts;
  }

  for (key in counts.data) {
    entry = counts.data[key];
    entry.total = Object.keys(entry.marks).length + Object.keys(entry.scales).length;
  }

  for (key in counts.scales) {
    entry = counts.scales[key];
    entry.markTotal = Object.keys(entry.marks).length;
    entry.guideTotal = Object.keys(entry.guides).length;
    entry.total = entry.markTotal + entry.guideTotal;
  }

  return (counts._totaled = true), counts;
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
function dataRef(state: State, scale, ref) {
  let sets = {},
    data,
    did,
    field,
    i,
    len,
    keys;

  // One ref
  if (ref.length === 1) {
    ref = ref[0];
    data = getInVis(state, 'datasets.' + ref.data);
    return sortDataRef(data, scale, ref.field);
  }

  // More than one ref
  for (i = 0, len = ref.length; i < len; ++i) {
    data = getInVis(state, 'datasets.' + ref[i].data);
    field = ref[i].field;
    sets[(did = data.get('_id'))] = sets[did] || (sets[did] = []);
    sets[did].push(field);
  }

  keys = Object.keys(sets);
  if (keys.length === 1) {
    return sortDataRef(data, scale, sets[did]);
  }

  ref = {fields: []};
  for (i = 0, len = keys.length; i < len; ++i) {
    data = getInVis(state, 'datasets.' + keys[i]);
    ref.fields.push(sortDataRef(data, scale, sets[keys[i]]));
  }

  return ref;
}

function sortDataRef(data, scale, field) {
  const ref = {data: name(data.get('name')), field: field};
  if (scale.type === 'ordinal' && data.get('_sort')) {
    const sortField = getIn(data, '_sort.field');
    return extend({}, ref, {
      sort: sortField === ref.field ? true : {field: sortField, op: 'min'},
      _sortOrder: getIn(data, '_sort.order')
    });
  }

  const dsId = data.get('_id'),
    count = counts.data[dsId] || (counts.data[dsId] = duplicate(DATA_COUNT));
  count.scales[scale._id] = true;
  return ref;
}

module.exports.exportName = name;
module.exports.counts = getCounts;
