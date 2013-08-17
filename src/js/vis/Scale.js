vde.Vis.Scale = (function() {
  var scale = function(name, pipeline, properties, displayName) {
    var scaleName = 'scale_' + (vg.keys(pipeline.scales).length+1);
    this.name  = (name || pipeline.name + '_' + scaleName);
    this.displayName = displayName;

    this.properties = properties;
    this.properties.points || (this.properties.points = true);

    this.pipelineName = pipeline.name;
    pipeline.scales[this.name] = this;

    return this;
  };

  var prototype = scale.prototype;

  prototype.spec = function() {
    var spec = vg.duplicate(this.properties);

    vde.Vis.Callback.run('scale.pre_spec', this, {spec: spec});

    spec.name = this.name;
    spec.domain = {data: this.properties.field.pipelineName || this.pipeline().name, field: this.properties.field.spec()};
    spec.range = (this.properties.range instanceof vde.Vis.Field) ? this.properties.range.spec() : this.properties.range;

    delete spec.pipeline;
    delete spec.field;

    vde.Vis.Callback.run('scale.post_spec', this, {spec: spec});

    return spec;
  };

  prototype.def = function() {
    // TODO

    return null;
  };

  prototype.type  = function() { return this.properties.type; };
  prototype.field = function() { return this.properties.field; };
  prototype.range = function() { return this.properties.range; };

  prototype.pipeline = function() {
    return vde.Vis.pipelines[this.pipelineName];
  };

  prototype.equals = function(b) {
    var a = {}, self = this;

    vg.keys(b).forEach(function(k) {
      a[k] = self.properties[k];
    });

    return JSON.stringify(a) == JSON.stringify(b);
  };

  prototype.bindProperty = function(prop, opts) {
    var field = opts.field;
    if(!field) return; // Because this makes negatory sense.
    if(!(field instanceof vde.Vis.Field)) field = new vde.Vis.Field(field);

    this.properties[prop] = field;
  };

  return scale;
})();