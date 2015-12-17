var Dataset = require('./Dataset');

function Pipeline(name) {
  this._aggregates = [];
  return Dataset.call(this, name);
}

var prototype = (Pipeline.prototype = Object.create(Dataset.prototype));
prototype.constructor = Pipeline;

module.exports = Pipeline;