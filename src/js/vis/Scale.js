vde.Vis.Scale = (function() {
  var scale = function(name, pipeline, properties) {
    var scaleName = 'scale_' + (vg.keys(pipeline.scales).length+1);
    this.name  = (name || pipeline.name + '_' + scaleName);
    this.displayName = scaleName;

    this.properties = properties;

    this.pipeline = pipeline;
    this.pipeline.scales[this.name] = this;

    return this;
  };

  var prototype = scale.prototype;

  prototype.spec = function() {
    var spec = vg.duplicate(this.properties);

    vde.Vis.Callback.run('scale.pre_spec', this, {spec: spec});

    spec.name = this.name;
    spec.domain = {data: this.properties.field.pipelineName || this.pipeline.name, field: this.properties.field.spec()};
    spec.range = this.properties.range.spec();
    delete spec.pipeline;
    delete spec.field;

    vde.Vis.Callback.run('scale.post_spec', this, {spec: spec});

    return spec;
  };

  prototype.def = function() {
    // TODO

    return null;
  };

  prototype.equals = function(b) {
    var a = {}, self = this;

    vg.keys(b).forEach(function(k) {
      a[k] = self.properties[k];
    });

    return JSON.stringify(a) == JSON.stringify(b);
  };

  prototype.bindProperty = function(prop, opts) {
    if(!opts.field) return; // Because this makes no sense

    this.properties[prop] = new vde.Vis.Field(opts.field);
  };

  return scale;
})();