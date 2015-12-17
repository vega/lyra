var dl = require('datalib'),
    promisify = require('es6-promisify'),
    Primitive = require('../Primitive');

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
          })
          .catch(function(err) { console.error(err); }));
      }
    }
  });
};

// TODO: values from source. Read from parsed vg model?
prototype.values = function() {
  return this._values || this._vals;
};

prototype.schema = function() {
  if (this._schema) return this._schema;
  return (this._schema = dl.type.inferAll(this.values()));
};

prototype.summary = function() {
  if (this._summary) return this._summary;
  return (this._summary = dl.summary(this.values()).reduce(function(s, p) {
    return (s[p.field] = p, s);
  }, {}));
};

// Values are cached. Export them only if we're not resolving. 
prototype.export = function(resolve) {
  var spec = Primitive.prototype.export.call(this, resolve);
  if (this._values) spec.values = this._values;
  else if (this._vals && !resolve) spec.values = this._vals;
  return spec;
};

module.exports = Dataset;