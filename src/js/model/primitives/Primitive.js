/* eslint no-undefined:0 */
'use strict';

var dl = require('datalib'),
    sg = require('../signals'),
    model = require('../'),
    lookup = model.lookup,
    counter = require('../../util/counter');

/**
 * @classdesc A Lyra Primitive.
 *
 * @description Lyra primitives are wrappers around corresponding Vega
 * definitions. Lyra-specific properties are denoted with an underscore prefix
 * and are removed during clean exports. Each Lyra primitive is given a unique
 * identifier, and these identifiers are used to store references to other
 * primitives.
 *
 * @constructor
 */
function Primitive() {
  this._id = this._id || counter.global();
  model.primitive(this._id, this);
}

function _clean(spec, clean) {
  var k, p, c, cln = clean !== false;
  for (k in spec) {
    p = spec[k];
    c = k.startsWith('_');
    c = c || p._disabled || p === undefined;
    if (c) {
      delete spec[k];
    } else if (dl.isObject(p)) {
      spec[k] = p.signal && cln ? sg.get(p.signal) : _clean(spec[k], clean);
    }
  }

  return spec;
}

/**
 * Initializes the Primitive. This is often where properties will be replaced
 * with Lyra-specific signals to drive reactive updates.
 * @returns {Object} The Primitive.
 */
Primitive.prototype.init = function() {
  return this;
};

/**
 * Exports the primitive as a complete Vega specification.
 * @param  {boolean} [clean=true] - Should Lyra-specific properties be removed
 * or resolved (e.g., converting property signal references to actual values).
 * @returns {Object} A Vega specification.
 */
Primitive.prototype.export = function(clean) {
  return _clean(dl.duplicate(this), clean);
};

/**
 * Exports the primitive as a complete Vega specification with extra definitions
 * to power Lyra-specific interaction (e.g., extra manipulator mark definitions).
 * @returns {Object} A Vega specification.
 */
Primitive.prototype.manipulators = Primitive.prototype.export;

/**
 * Gets or sets the parent of the Primitive. A Primitive's parent represents a
 * "contains" relationship. Thus, a Primitive may have only one parent but a
 * single parent may have many children.
 * @param  {number} [pid] - The ID of the parent to set.
 * @returns {Object} The parent Primitive, if called as a getter, otherwise the
 * current Primitive.
 */
Primitive.prototype.parent = function(pid) {
  if (!arguments.length) {
    return lookup(this._parent);
  }
  return (this._parent = Number(pid), this);
};

module.exports = Primitive;
