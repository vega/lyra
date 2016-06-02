/* eslint no-undefined:0 */
'use strict';
var dl = require('datalib'),
    inherits = require('inherits'),
    Primitive = require('../Primitive'),
    Pipeline = require('../data/Pipeline'),
    Dataset = require('../data/Dataset'),
    manips = require('./manipulators'),
    rules = require('../../rules'),
    model = require('../../'),
    lookup = model.lookup,
    getParent = require('../../../util/hierarchy').getParent,
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

  // this.from starts as undefined

  this._rule = new rules.VLSingle(type);
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
 * Overwrite the properties of a mark with values from a provided configuration
 * object.
 *
 * @param {Object} newProps - An object of properties to assign to the mark
 * @chainable
 * @returns {void}
 */
Mark.prototype.update = function(newProps) {
  // Copy properties off of provided configuration
  for (var key in newProps) {
    // Assignment is safe b/c this will primarily be used to set values derived
    // from the store via .toJS, which does not generate consistent references
    this[key] = newProps[key];
  }
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
    return from && lookup(getParent(from)._id);
  } else if ((from = lookup(id)) instanceof Dataset) {
    this.from = id;
    return this;
  } else if (from instanceof Pipeline) {
    this.from = from._source._id;
    return this;
  }

  this.from = undefined;
  return this;
};

Mark.prototype.export = function(clean) {
  var spec = Primitive.prototype.export.call(this, clean),
      props = spec.properties,
      update = this.properties.update,
      upspec = props.update,
      from = this.from && lookup(this.from),
      keys = dl.keys(upspec),
      k, v, u, i, len, s, f;

  if (from) {
    spec.from = (from instanceof Mark) ? {mark: from.name} :
      {data: from.name};
  }

  for (i = 0, len = keys.length; i < len; ++i) {
    v = upspec[k = keys[i]];
    u = update[k];
    if (!dl.isObject(v)) {  // signalRef resolved to literal
      v = upspec[k] = {value: v};
    }

    if (u.scale) {
      v.scale = (s = lookup(u.scale)) && s.name;
    }
    if (u.field) {
      v.field = (f = lookup(u.field)) && f._name;
    }
    if (u.group) {
      v.field = {group: u.group};
    }
  }

  if (!clean) {
    spec.lyra_id = this._id;
  }

  return spec;
};

/**
 * Unsets the mark and its VLSingle _rule from the model primitives store.
 * Signals are not impacted by this method; they are cleaned up via the
 * MARK_DELETE action within the signals reducer.
 *
 * @returns {void}
 */
Mark.prototype.remove = function() {
  // Clear this mark's VLSingle
  model.primitive(this._rule._id, null);

  // Clear this mark itself
  model.primitive(this._id, null);

  // Clean out stale listener properties for this object from the listeners
  // array in the model
  model.removeListeners(this);
};

manips(Mark.prototype);
rules(Mark.prototype);

module.exports = Mark;
