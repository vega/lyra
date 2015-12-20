var dl = require('datalib'),
    promisify = require('es6-promisify'),
    Primitive = require('../Primitive'),
    Field = require('./Field');

function Dataset(name) {
  this.name = name;

  this.source = undefined;
  this.url    = undefined;
  this.format = undefined;

  return Primitive.call(this);
}

var prototype = (Dataset.prototype = Object.create(Primitive.prototype));
prototype.constructor = Dataset;

prototype.init = function(opt) {
  var self = this;
  return new Promise(function(resolve, reject) {
    if (dl.isString(opt)) {
      resolve((self.source = opt, self));
    } else if (dl.isArray(opt)) {
      resolve((self._values = opt, self));
    } else {  // opt is an object
      self.format = opt.format;
      if (opt.values) {
        resolve((self._values = dl.read(opt.values, self.format), self));
      } else if (opt.url) {
        resolve(promisify(dl.load)({ url: (self.url=opt.url) })
          .then(function(data) { 
            self._vals = dl.read(data, self.format); 
            return self;
          }));
      }
    }
  });
};

prototype.input = function() {
  return this._values || this._vals;
};

prototype.output = function() {
  var view = require('../../').view;
  return view ? view.data(this.name).values() : this.input();
};

prototype.schema = function() {
  if (this._schema) return this._schema;
  var self = this, types  = dl.type.inferAll(this.output());
  var schema = dl.keys(types).reduce(function(s, k) {
    s[k] = new Field(k, types[k]).parent(self._id);
    return s;
  }, {});

  return (this._schema = schema);
};

prototype.summary = function() {
  var s = this.schema();
  return dl.summary(this.output()).map(function(p) {
    return s[p.field].profile(p);
  });
};

// Values are cached. Export them only if we're not resolving. 
prototype.export = function(resolve) {
  var spec = Primitive.prototype.export.call(this, resolve);
  if (this._values) spec.values = this._values;
  else if (this._vals && !resolve) spec.values = this._vals;
  return spec;
};

module.exports = Dataset;