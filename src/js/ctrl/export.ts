import {array, extend, isArray, isObject, isString, Mark, Spec} from 'vega';
import MARK_EXTENTS from '../constants/markExtents';
import {State, store} from '../store';
import {GuideType} from '../store/factory/Guide';
import {InteractionRecord, MarkApplicationRecord} from '../store/factory/Interaction';
import {GroupRecord} from '../store/factory/marks/Group';
import {PipelineRecord} from '../store/factory/Pipeline';
import {WidgetRecord} from '../store/factory/Widget';
import {input} from '../util/dataset-utils';
import duplicate from '../util/duplicate';
import name from '../util/exportName';
import exportName from '../util/exportName';
import {propSg} from '../util/prop-signal';
import {signalLookup} from '../util/signal-lookup';
import {addApplicationToScene, addDatasetsToScene, addInputsToScene, addSelectionToScene, addVoronoiMark, addWidgetApplicationToScene, addWidgetSelectionToScene, getScaleInfoForGroup, pushSignalsInScene, getFieldsOfGroup} from './demonstrations';
import manipulators from './manipulators';

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
 * @returns {Object} A Vega specification.
 */
export function exporter(internal: boolean = false): Spec {
  const state = store.getState();
  const int = internal === true;

  counts = duplicate(SPEC_COUNT);

  let spec: Spec = exporter.scene(state, int);
  spec.data = exporter.pipelines(state, int);

  // Add interactions and widgets from store
  spec = exporter.interactions(state, spec);
  spec = exporter.widgets(state, spec);
  return spec;
}

exporter.interactions = function(state: State, spec) {
  state.getIn(['vis', 'present', 'interactions']).forEach((interaction: InteractionRecord) => {
    const group: GroupRecord = state.getIn(['vis', 'present', 'marks', String(interaction.groupId)]);
    const groupName = exportName(group.name);
    const scaleInfo = getScaleInfoForGroup(state, group._id);
    const fieldsOfGroup = getFieldsOfGroup(state, group._id);
    const mouseTypes = group._interactions.map(interactionId => {
      const interaction: InteractionRecord = state.getIn(['vis', 'present', 'interactions', String(interactionId)]);
      if (!interaction.input) { return null; }
      return interaction.input.mouse;
    }).filter(x => x);
    const exclusive = (new Set(mouseTypes)).size !== mouseTypes.length; // if there's more than one drag, for example, drag should not activate when shift+drag activates
    spec = addDatasetsToScene(spec, groupName, interaction.id);
    spec = addInputsToScene(spec, groupName, interaction.id, interaction.input, scaleInfo, fieldsOfGroup, exclusive);
    if (interaction.selection) {
      spec = addSelectionToScene(spec, groupName, interaction.id, interaction.input, interaction.selection);
    }
    if (interaction.applications.length) {
      for (const application of interaction.applications) {
        spec = addApplicationToScene(spec, groupName, interaction.id, interaction.input, application);
        if (interaction.input && interaction.input.mouse && interaction.input.mouse === 'mouseover' && interaction.input.nearest) {
          const targetMarkName = (application as any).targetMarkName;
          if (targetMarkName) {
            const encoding = interaction.selection && interaction.selection.type === 'point' ? interaction.selection.encoding : null;
            spec = addVoronoiMark(spec, groupName, encoding, targetMarkName, interaction.id, application.id);
          }
        }
      }
    }
    spec = pushSignalsInScene(spec, groupName, interaction.signals);
  });

  return spec;
}

exporter.widgets = function(state: State, spec) {
  state.getIn(['vis', 'present', 'widgets']).forEach((widget: WidgetRecord) => {
    const group: GroupRecord = state.getIn(['vis', 'present', 'marks', String(widget.groupId)]);
    const groupName = exportName(group.name);
    if (widget.selection) {
      spec = addWidgetSelectionToScene(spec, widget, widget.selection);
    }
    if (widget.applications.length) {
      for (const application of widget.applications) {
        spec = addWidgetApplicationToScene(spec, groupName, widget, application);
      }
    }
  });

  return spec;
}

exporter.pipelines = function(state: State, internal: boolean) {
  const pipelines: PipelineRecord[] = getInVis(state, 'pipelines').valueSeq();
  return pipelines.reduce(function(spec, pipeline) {
    spec.push(exporter.dataset(state, internal, pipeline._source));

    const aggrs = pipeline._aggregates.toJS();
    for (const key in aggrs) {
      spec.push(exporter.dataset(state, internal, aggrs[key]));
    }
    return spec;
  }, []);
};

exporter.dataset = function(state: State, internal: boolean, id: number) {
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

  spec.transform.forEach(s => {
    if (s.type === 'lookup') {
      s.from = state.getIn(['vis', 'present', 'datasets', s.from, 'name'])
    }
  })

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

exporter.scene = function(state: State, internal: boolean): Mark {
  const sceneId = state.getIn(['vis', 'present', 'scene', '_id']);
  let spec = exporter.group(state, internal, sceneId);

  if (internal) {
    spec = spec[0];
  }

  // Remove mark-specific properties that do not apply to scenes.
  // delete spec.type;
  delete spec.from;
  delete spec.encode;

  return spec;
};

exporter.mark = function(state: State, internal: boolean, id: number) {
  const mark = getInVis(state, 'marks.' + id).toJS();
  const spec = clean(duplicate(mark), internal);
  const up = mark.encode.update;
  const upspec = spec.encode.update;
  const facet = mark._facet;

  if (facet) {
    spec.from = {data: facet.name};
  } else if (spec.from) {
    let fromId;
    if ((fromId = spec.from.data)) {
      spec.from.data = name(getInVis(state, 'datasets.' + fromId + '.name'));
      const count = counts.data[fromId] || (counts.data[fromId] = duplicate(DATA_COUNT));
      count.marks[id] = true;
    } else if ((fromId = spec.from.mark)) {
      spec.from.mark = name(getInVis(state, 'marks.' + fromId + '.name'));
    }
  }

  Object.keys(upspec).forEach(function(key) {
    let specVal = upspec[key];
    const origVal = up[key];
    const origScale = origVal.scale;

    if (!isObject(specVal)) {
      // signalRef resolved to literal
      specVal = upspec[key] = {value: specVal};
    }

    // Use the origVal to determine if scale/fields have been set in case
    // specVal was replaced above (e.g., scale + signal).
    if (origScale) {
      specVal.scale = name(getInVis(state, 'scales.' + origScale + '.name'));
      const count = counts.scales[origScale] || (counts.scales[origScale] = duplicate(SCALE_COUNT));
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
    if (tmpl && !tmpl.startsWith('brush')) {
      tmpl = tmpl.split(RegExp('{{(.*?)}}')).map(s => {
        if (s.indexOf('datum') >= 0) {
          return `+ ${s} + `;
        }
        else {
          if (s.startsWith('#')) {
            return `+ ${s.substring(1)} + `;
          }
          return `"${s}"`;
        }
      }).join('');
      spec.encode.update.text.signal = tmpl;
    }
  }

  if (internal) {
    spec.role = `lyra_${mark._id}`;
    const s = manipulators(mark, spec);
    return facet ? pathgroup(state, s, facet) : s;
  }

  return facet ? pathgroup(state, spec, facet) : spec;
};

function pathgroup(state, marks, facet) {
  return {
    name: 'pathgroup',
    type: 'group',
    from: {
      facet: {
        ...facet,
        data: name(getInVis(state, 'datasets.' + facet.data + '.name'))
      }
    },
    encode: {
      update: {
        width: {field: {group: 'width'}},
        height: {field: {group: 'height'}}
      }
    },
    marks: array(marks)
  }
}

exporter.group = function(state: State, internal: boolean, id: number) {
  const mark: GroupRecord = getInVis(state, `marks.${id}`);
  const spec = exporter.mark(state, internal, id);
  const group = internal ? spec[0] : spec;

  ['scale', 'mark', 'axe', 'legend'].forEach(function(childType) {
    const childTypes = childType + 's', // Pluralized for spec key.
      storePath = childTypes === 'axes' || childTypes === 'legends' ? 'guides' : childTypes;

    // Route export to the most appropriate function.
    group[childTypes] = mark[childTypes]
      .map(cid => {
        const child = getInVis(state, `${storePath}.${cid}`);
        return !child ? null :
          exporter[child.type] ? exporter[child.type](state, internal, cid) :
          exporter[childType]  ? exporter[childType](state, internal, cid) :
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
  }

  return spec;
};

exporter.area = function(state: State, internal: boolean, id: number) {
  const spec = exporter.mark(state, internal, id);
  const area = array(spec.name === 'pathgroup' ? spec.marks : spec)[0];
  const update = area.encode.update;

  // Export with dummy data to have an initial area appear on the canvas.
  if (!area.from) {
    area.from = {data: 'dummy_data'};
    update.x = {signal: `datum.x + ${propSg(id, 'area', 'x')}`};
    update.y = {signal: `datum.y + ${propSg(id, 'area', 'y')}`};
  }

  if (update.orient.value === 'horizontal') {
    delete update.y2;
  } else {
    delete update.x2;
  }

  return spec;
};

exporter.line = function(state: State, internal: boolean, id: number) {
  const spec = exporter.mark(state, internal, id);
  const line = array(spec.name === 'pathgroup' ? spec.marks : spec)[0];
  const update = line.encode.update;

  // Export with dummy data to have an initial area appear on the canvas.
  if (!line.from) {
    line.from = {data: 'dummy_data'};
    update.x = {signal: `datum.x + ${propSg(id, 'line', 'x')}`};
    update.y = {signal: `datum.y + ${propSg(id, 'line', 'y')}`};
  }

  return spec;
};

exporter.scale = function(state: State, internal: boolean, id: number) {
  const scale = getInVis(state, 'scales.' + id).toJS(),
    spec = clean(duplicate(scale), internal);

  counts.scales[id] = counts.scales[id] || duplicate(SCALE_COUNT);

  if (!scale.domain && scale._domain && scale._domain.length ) {
    spec.domain = scale._manual && scale._manualDomain.length ? scale._manualDomain : dataRef(state, scale, scale._domain);
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

exporter.axe = exporter.legend = function(state: State, internal: boolean, id: number) {
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
        if ((prop as any).signal.startsWith('lyra')) { spec[key] = signalLookup((prop as any).signal); }
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
 *   {"data": ..., "fields": [...]} for multiple fields from the same dataset.
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
  let ref;
  if (Array.isArray(field)) {
    ref = { data: name(data.get('name')), fields: field };
  } else {
    ref = { data: name(data.get('name')), field: field };
  }
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
