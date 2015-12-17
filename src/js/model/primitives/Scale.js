var Primitive = require('./Primitive');

function Scale(name, type, domain, range) {
  this.name = name;
  this.type = type;
  this.domain = domain;
  this.range  = range;
  return Primitive.call(this);
}

var prototype = (Scale.prototype = Object.create(Primitive.prototype));
prototype.constructor = Scale;

module.exports = Scale;