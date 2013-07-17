vde.Vis.Transform = (function() {
  var transform = function(type, input, output) {
    this.type = type;

    this.input = input;
    this.output = output;

    this.pipeline = null;

    this.properties = {};

    return this;
  };

  var prototype = transform.prototype;

  prototype.spec = function() {
    var spec = {type: this.type};
    for(var i in this.inputs)
      spec[i] = this.properties[i];

    return spec;
  };

  prototype.bindProperty = function(prop, opts) {
    if(!opts.field) return; // Because this makes negatory sense.

    this.properties[prop] = new vde.Vis.Field(opts.field);
  };

  // Assumes data is already ingested
  prototype.transform = function(data) {
    var transform = vg.parse.dataflow({transform: [this.spec()]})
    return transform(data);
  };

  return transform;
})();

vde.Vis.transforms = {};