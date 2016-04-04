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
 * @property {Object} _rule - A {@link http://vega.github.io/vega-lite/docs/#spec|Vega-Lite specification}
 * that is compiled each time a data field is dropped over channel manipulators.
 * @see Vega's {@link https://github.com/vega/vega/wiki/Marks|Marks}
 * documentation for more information on this class' "public" properties.
 *
 * @constructor
 * @param {Object} props - Configuration options
 * @param {string} props.type - The type of mark, e.g. "rect"
 * @param {name}   [props.name] - The name of the mark (set based on type
 * if not provided in props object)
 * @param {number} [props._id] - The ID of the mark (set as a unique number
 * if not provided in props object)
 * @param {Object} [props.properties] - Mark properties object (initialized
 * to reasonable defaults if not provided in props object)
 */
function Mark(props) {
  var type = props.type,
      key;
  // Copy properties off of provided configuration
  for (key in props) {
    this[key] = props[key];
  }
  // Provide a default for name if it was not provided
  this.name = this.name || (type + '_' + counter.type(type));
  // this.from; // Should start as undefined

  this._rule = new rules.VLSingle(type);

  return Primitive.call(this);
}

inherits(Mark, Primitive);

/**
 * Return an object of the default properties for any mark
 * @static
 * @returns {Object} An object specifying the default .properties value for
 * basic marks
 */
Mark.defaultProperties = function() {
  return {
    update: {
      x: {value: 25},
      y: {value: 25},
      fill: {value: '#4682b4'},
      fillOpacity: {value: 1},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0.25}
    }
  };
};

/**
 * Intelligently merge (one level deep) a custom properties object with a
 * default properties object.
 *
 * @static
 * @param {Object} defaults The default properties for a mark
 * @param {Object} [overrides] - An optional object of property overrides to
 * combine with the provided defaults
 * @returns {Object} The merged properties object
 */
Mark.mergeProperties = function(defaults, overrides) {
  if (typeof overrides !== 'object') {
    return defaults;
  }

  // Merge all properties from the provided overrides into the defaults
  return Object.keys(overrides).reduce(function(props, key) {

    if (typeof props[key] !== 'object') {
      // No merge necessary if defaults does not have a property matching the
      // provided overrides, or that prop is not an object: overwrite normally
      props[key] = overrides[key];
    } else {
      // Merge all of the [vega mark] properties object's [js object] properties
      // (`.update`, `.enter`, etcetera)
      props[key] = dl.extend(props[key], overrides[key]);
    }

    return props;
  }, defaults);
};

/**
 * Initializes the Lyra Mark Primitive by converting all registered visual
 * properties with literal values to Lyra-specific signals. Each mark subclass
 * will register the necessary streams to change the signal values
 * (e.g., `initHandlers`).
 * @returns {Object} The Mark.
 */
Mark.prototype.init = function() {
  // Partial application to avoid needing access to `this` inside the loop below
  var signalName = function(mark, key) {
    return propSg(mark, key);
  }.bind(null, this);

  // Walk through each of the specified visual properties for this mark, create
  // and register signals to represent those values, and update the mark's
  // properties to contain references to those new vega signals.
  this.properties.update = Object.keys(this.properties.update).reduce(function(update, key) {
    var updateProp = update[key],
        sgName = signalName(key);
    if (typeof updateProp.value !== 'undefined') {
      sg.init(sgName, updateProp.value);
      update[key] = dl.extend(sg.reference(sgName), updateProp._disabled ? {_disabled: true} : {});
    }
    return update;
  }, this.properties.update);

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
