var Primitive = require('../Primitive'),
    Dataset = require('./Dataset');

function Pipeline(name) {
  Primitive.call(this);
  this._source = new Dataset(name).parent(this._id);
  this._aggregates = [];
  return this;
}

var prototype = (Pipeline.prototype = Object.create(Primitive.prototype));
prototype.constructor = Pipeline;
prototype.parent = null;

prototype.export = function(resolve) {
  return [this._source.export(resolve)]
    .concat(this._aggregates.map(function(a) { return a.export(resolve); }));
};

module.exports = Pipeline;