'use strict';

// Ensure startsWith polyfill has loaded, to maintain IE compatibility
require('string.prototype.startswith');

var dl = require('datalib'),
    lookup = require('../model').lookup,
    sg = require('../model/signals'),
    Group = require('../model/primitives/marks/Group'),
    Guide = require('../model/primitives/Guide'),
    Mark = require('../model/primitives/marks/Mark');

// This object will be assigned the various exporter methods as function
// properties, keyed by the string type (e.g. "rect") of the primitive that
// exporter function is for. All types are declared, even if there is no
// custom exporter for that mark (many just use exportMark with no further
// modifications). This is done so that nested marks, like groups, can use
// `exporters[type]` as a way to get the export function for a specific
// primitive instance. (`exporters` also serves as the base for module.exports)
var exporters = {};

/**
 * Utility method to clean a spec object
 * @param {Object} spec - A Lyra representation of a Vega spec
 * @param {Boolean} shouldClean - Whether to clean Lyra-specific values
 * @returns {Object} A cleaned spec object
 */
function _clean(spec, shouldClean) {
  var key, prop, cleanKey;
  for (key in spec) {
    prop = spec[key];
    cleanKey = key.startsWith('_');
    cleanKey = cleanKey || prop._disabled || typeof prop === 'undefined';
    if (cleanKey) {
      delete spec[key];
    } else if (dl.isObject(prop)) {
      if (prop.signal && shouldClean !== false) {
        // Render signals to their value
        spec[key] = sg.value(prop.signal);
      } else {
        // Recurse
        spec[key] = _clean(spec[key], shouldClean);
      }
    }
  }

  return spec;
}

// Exports FieldIDs to DataRefs. We don't default to the last option as the
// structure has performance implications in Vega. Most-least performant:
//   {"data": ..., "field": ...} for a single field
//   {"data": ..., "field": [...]} for multiple fields from the same dataset.
//   {"fields": [...]} for multiple fields from distinct datasets.
function getFieldName(field) {
  return field._name;
}

/**
 * Export a data reference object. From most to least performant, these are the
 * output object signatures:
 * - Single field: {"data": ..., "field": ...}
//   {"data": ..., "field": [...]} for multiple fields from the same dataset.
//   {"fields": [...]} for multiple fields from distinct datasets.
 * @param  {Array} ref - A data reference
 * @returns {Object} A data reference object
 */
function _dataRef(ref) {
  var sets = {},
      data, field, i, len, keys;

  if (ref.length === 1 && (ref = ref[0])) {
    field = lookup(ref);
    ref = {
      data: field.parent().name,
      field: field._name
    };
  } else {
    for (i = 0, len = ref.length; i < len; ++i) {
      field = lookup(ref[i]);
      data = field.parent();
      sets[data._id] = sets[data._id] || (sets[data._id] = []);
      sets[data._id].push(field);
    }

    keys = dl.keys(sets);
    if (keys.length === 1) {
      ref = {
        data: data.name,
        field: sets[data._id].map(getFieldName)
      };
    } else {
      ref = {
        fields: keys.map(function(key) {
          data = lookup(keys[i]);
          return {
            data: data.name,
            field: sets[data._id].map(getFieldName)
          };
        })
      };
    }
  }
  return ref;
}

function exportPrimitive(primitive, shouldClean) {
  return _clean(dl.duplicate(primitive), shouldClean);
}

function exportMark(mark, shouldClean) {
  var spec = exportPrimitive(mark, shouldClean),
      props = spec.properties,
      update = props.update,
      from = mark.from && lookup(mark.from),
      keys = dl.keys(update);

  if (from) {
    spec.from = from instanceof Mark ?
      {mark: from.name} :
      {data: from.name};
  }

  keys.forEach(function(key) {
    var val = update[key];

    // signalRef resolved to literal
    if (!dl.isObject(val)) {
      update[key] = {
        value: val
      };
    }

    // Parse reference values out to their associated primitive's name
    if (val.scale) {
      val.scale = lookup(val.scale).name;
    }
    if (val.field) {
      val.field = lookup(val.field)._name;
    }
    if (val.group) {
      val.field = {
        group: val.group
      };
    }
  });

  if (!shouldClean) {
    spec.lyra_id = mark._id;
  }

  return spec;
}

function exportArea(area, shouldClean) {
  var spec = exportMark(area, shouldClean);

  // Handle exporting with the dummy data needed to render the placeholder area mark
  if (!spec.from) {
    spec.from = {
      data: 'dummy_data_area'
    };
    spec.properties.update.x = {
      field: 'x'
    };
    spec.properties.update.y = {
      field: 'y'
    };
  }

  if (spec.properties.update.orient.value === 'horizontal') {
    delete spec.properties.update.y2;
  } else {
    delete spec.properties.update.x2;
  }

  return spec;
}

function exportGroup(group, shouldClean) {
  var spec = exportMark(group, shouldClean);

  function cleanChild(id) {
    var child = lookup(id);
    if (child.type && typeof exporters[child.type] === 'function') {
      return exporters[child.type](child, shouldClean);
    }
    return exportPrimitive(child, shouldClean);
  }

  // Recursively clean children
  Group.CHILD_TYPES.forEach(function(childType) {
    spec[childType] = group[childType].map(cleanChild);
  });
  return spec;
}

function exportGuide(guide, shouldClean) {
  var spec = exportPrimitive(guide, shouldClean),
      guideType = guide._gtype,
      type = guide._type;

  if (guideType === Guide.TYPES.AXIS) {
    spec.scale = lookup(spec.scale).name;
  } else if (guideType === Guide.TYPES.LEGEND) {
    spec[type] = lookup(spec[type]).name;
  }

  return spec;
}

function exportLine(line, shouldClean) {
  var spec = exportMark(line, shouldClean);

  // Handle exporting with the dummy data needed to render the placeholder line mark
  if (!spec.from) {
    spec.from = {
      data: 'dummy_data_line'
    };
    spec.properties.update.x = {
      field: 'foo'
    };
    spec.properties.update.y = {
      field: 'bar'
    };
  }

  // Remove mark properties that are not relevant to lines
  delete spec.properties.update.fill;
  delete spec.properties.update.fillOpacity;

  return spec;
}

function exportScale(scale, shouldClean) {
  var spec = exportPrimitive(scale, shouldClean);

  if (!scale.domain && scale._domain.length) {
    spec.domain = _dataRef(scale._domain);
  }

  if (!scale.range && scale._range.length) {
    scale.range = _dataRef(scale._range);
  }

  return spec;
}

function exportScene(scene, shouldClean) {
  var spec = exportGroup(scene, shouldClean);

  // Always resolve width/height signals
  spec.width = spec.width.signal ? sg.value('vis_width') : spec.width;
  spec.height = spec.height.signal ? sg.value('vis_height') : spec.height;

  // Remove mark-specific properties that do not apply to scenes
  delete spec.type;
  delete spec.from;
  delete spec.properties;

  return spec;
}

exporters.area = exportArea;
exporters.group = exportGroup;
exporters.guide = exportGuide;
exporters.line = exportLine;
exporters.mark = exportMark;
exporters.primitive = exportPrimitive;
exporters.rect = exportMark;
exporters.scale = exportScale;
exporters.scene = exportScene;
exporters.symbol = exportMark;
exporters.text = exportMark;

// Export the exporters, plus their utility methods
module.exports = exporters;
module.exports._clean = _clean;
module.exports._dataRef = _dataRef;
