'use strict';
var dl = require('datalib'),
    inherits = require('inherits'),
    sg = require('../../signals'),
    Primitive = require('../Primitive'),
    Pipeline = require('../data/Pipeline'),
    Dataset = require('../data/Dataset'),
    manips = require('./manipulators'),
    rules = require('../../rules'),
    propSg = require('../../../util/prop-signal'),
    model = require('../../'),
    lookup = model.lookup,
    counter = require('../../../util/counter');

/**
 * @classdesc A Lyra Mark Primitive.
 *
 * @description The Mark Primitive is an abstract base class. Each mark type
 * that Lyra supports should subclass it.
 * @extends {Primitive}
 *
 * @param {string} type - The mark type (e.g., `rect`, `symbol`, etc.).
 *
 * @property {Object} _rule - A {@link http://vega.github.io/vega-lite/docs/#spec|Vega-Lite specification}
 * that is compiled each time a data field is dropped over channel manipulators.
 * @see Vega's {@link https://github.com/vega/vega/wiki/Marks|Marks}
 * documentation for more information on this class' "public" properties.
 *
 * @constructor
 * @param {Object} config - Configuration options
 * @param {string} config.type - The type of mark, e.g. "rect"
 * @param {name}   [config.name] - The name of the mark (set based on type
 * if not provided in config object)
 * @param {Object} [config.properties] - Mark properties object (initialized
 * to reasonable defaults if not provided in config object)
 */
function Mark(config) {
  var type = config.type;
  this.type = type;
  this.name = type + '_' + counter.type(type);
  this.type = type;
  this.from = undefined;

  var updateDefault = {
    x: {value: 25},
    y: {value: 25},
    fill: {value: '#4682b4'},
    fillOpacity: {value: 1},
    stroke: {value: '#000000'},
    strokeWidth: {value: 0.25}
  };

  // Pick up any passed-in properties from the provided configuration
  this.properties = dl.extend({
    update: {}
  }, config.properties);

  // dl.extend does not operate as a deep extender, so call it again for
  // the .update property specifically to ensure any properties passed in
  // via the configuration argument get set correctly
  this.properties.update = dl.extend(updateDefault, config.properties.update);

  this._rule = new rules.VLSingle(type);

  return Primitive.call(this);
}

inherits(Mark, Primitive);

/**
 * Initializes the Lyra Mark Primitive by converting all registered visual
 * properties with literal values to Lyra-specific signals. Each mark subclass
 * will register the necessary streams to change the signal values
 * (e.g., `initHandlers`).
 * @returns {Object} The Mark.
 */
Mark.prototype.init = function() {
  var props = this.properties,
      update = props.update,
      key, updateProp;

  // Walk through each of the specified visual properties for this mark, create
  // and register signals to represent those values, and update the mark's
  // properties to contain references to those new vega signals.
  for (key in update) {
    updateProp = update[key];
    if (typeof updateProp.value !== 'undefined') {
      sg.init(propSg(this, key), updateProp.value);
      update[key] = dl.extend(sg.reference(propSg(this, key)),
        updateProp._disabled ? {_disabled: true} : {});
    }
  }

  this.initHandles();

  return this;
};

/**
 * Get/set a mark's backing dataset.
 * @todo  Rename to `from`? A mark can be backed by another mark when connected.
 * @param  {number} [id] - The ID of a Dataset or Pipeline Primitive. If
 * Pipeline, then the source Dataset is used.
 * @returns {Object} If no ID is specified, the backing Dataset primitive if any.
 * If an ID is specified, the Mark is returned.
 */
Mark.prototype.dataset = function(id) {
  var from;
  if (!arguments.length) {
    from = lookup(this.from);
    return from && lookup(from.parent()._id);
  } else if ((from = lookup(id)) instanceof Dataset) {
    this.from = id;
    return this;
  } else if (from instanceof Pipeline) {
    // TODO
    this.from = from._source._id;
    return this;
  }

  this.from = undefined;
  return this;
};

/**
 * Initializes the interaction logic for the mark's handle manipulators. This
 * involves setting {@link https://github.com/vega/vega/wiki/Signals|the streams}
 * of the mark's property signals.
 * @returns {Object} The Mark.
 */
Mark.prototype.initHandles = function() {};

Mark.prototype.export = function(clean) {
  var spec = Primitive.prototype.export.call(this, clean),
      props = spec.properties,
      update = props.update,
      from = this.from && lookup(this.from),
      keys = dl.keys(update),
      k, v, i, len, s, f;

  if (from) {
    spec.from = (from instanceof Mark) ? {mark: from.name} :
      {data: from.name};
  }

  for (i = 0, len = keys.length; i < len; ++i) {
    v = update[k = keys[i]];
    if (!dl.isObject(v)) {  // signalRef resolved to literal
      update[k] = {value: v};
    }

    if (v.scale) {
      v.scale = (s = lookup(v.scale)) && s.name;
    }
    if (v.field) {
      v.field = (f = lookup(v.field)) && f._name;
    }
    if (v.group) {
      v.field = {group: v.group};
    }
  }

  if (!clean) {
    spec.lyra_id = this._id;
  }

  return spec;
};

manips(Mark.prototype);
rules(Mark.prototype);

module.exports = Mark;
