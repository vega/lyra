'use strict';

// Ensure startsWith polyfill has loaded, to maintain IE compatibility
require('string.prototype.startswith');

var dl = require('datalib'),
    lookup = require('../model').lookup,
    sg = require('../model/signals'),
    Group = require('../model/primitives/marks/Group'),
    Guide = require('../model/primitives/Guide'),
    Mark = require('../model/primitives/marks/Mark');

/**
 * Utility method to clean a spec object
 * @param {Object} spec - A Lyra representation of a Vega spec
 * @param {Boolean} shouldClean - Whether to clean Lyra-specific values
 * @return {Object} A cleaned spec object
 */
function _clean(spec, shouldClean) {
  var key, prop, cleanKey;
  for (key in spec) {
    prop = spec[key];
    cleanKey = key.startsWith('_');
    cleanKey = cleanKey || prop._disabled || prop === undefined;
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

function exportGroup(group, shouldClean) {
  var spec = exportMark(group, shouldClean);

  function cleanChild(id) {
    // @TODO: That this uses .export() is a fundamental blocker to this approach:
    // find a workaround! Keying against module.exports by type...?
    return lookup(id).export(shouldClean);
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

function exportMark(mark, shouldClean) {
  var spec = exportPrimitive(mark, shouldClean),
      props = spec.properties,
      update = props.update,
      from = mark.from && model.lookup(mark.from),
      keys = dl.keys(update);

  if (from) {
    spec.from = (from instanceof Mark) ?
      { mark: from.name } :
      { data: from.name };
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

function exportPrimitive(primitive, shouldClean) {
  return _clean(dl.duplicate(primitive), shouldClean);
}

module.exports = {
  _clean: _clean,
  group: exportGroup,
  guide: exportGuide,
  mark: exportMark,
  primitive: exportPrimitive,
  symbol: exportMark,
  text: exportMark
};
