vde.Vis.Transform = (function() {
  var transform = function(type, input, output) {
    this.type = type;

    this.input = input;
    this.output = output;

    this.pipelineName = null;
    this.forkPipeline = false;  // Structural transforms cause a fork
    this.requiresFork = false;

    this.isVisual     = false;

    this.properties = {};

    return this;
  };

  var prototype = transform.prototype;

  prototype.destroy = function() { return; }

  prototype.pipeline = function() {
    return vde.Vis.pipelines[this.pipelineName];
  };

  prototype.spec = function() {
    var spec = {type: this.type};
    for(var i = 0; i < this.input.length; i++) {
      var prop   = this.input[i], value  = this.properties[prop];
      spec[prop] = value instanceof vde.Vis.Field ? value.spec() : value;
    }

    return spec;
  };

  prototype.bindProperty = function(prop, opts) {
    var field = opts.field;
    if(!field) return; // Because this makes negatory sense.
    if(!(field instanceof vde.Vis.Field)) field = new vde.Vis.Field(field);

    this.properties[prop] = field;
  };

  prototype.unbindProperty = function(prop) {
    delete this.properties[prop];
  };

  // Assumes data is already ingested
  prototype.transform = function(data) {
    var transform = vg.parse.dataflow({transform: [this.spec()]})
    return transform(data);
  };

  return transform;
})();

vde.Vis.transforms = {};
