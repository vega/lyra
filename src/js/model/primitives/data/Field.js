var dl = require('datalib'),
    vl = require('vega-lite'),
    Primitive = require('../Primitive'),
    TYPES = vl.data.types;

function Field(name, ptype) {
  this._name = name;
  this._ptype = ptype;         // primitive type (boolean/string/etc.)
  this._type = TYPES[ptype];  // nominal, ordinal, etc.

  this._aggregate = null;
  this._bin = null;

  this.$ = dl.$(name);

  return Primitive.call(this);
}

var prototype = (Field.prototype = Object.create(Primitive.prototype));
prototype.constructor = Field;

prototype.profile = function(p) {
  if (p !== undefined) {
    return (this._profile = p, this);
  }
  else if (this._profile) {
    return this._profile;
  }
  else {
    return (this.parent().summary(), this._profile);
  }
};

module.exports = Field;
