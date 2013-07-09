vde.Vis.Scale = (function() {
  var scale = function(name, group, properties) {
    this.name  = (name || 'scale_' + (vg.keys(group.scales).length+1));
    this.displayName = this.name; // displayName = UI; this.name = Model/Spec;

    this.properties = properties;

    this.group = group;
    this.group.scales[this.name] = this;

    return this;
  };

  var prototype = scale.prototype;

  prototype.spec = function() {
    var spec = vg.duplicate(this.properties);
    spec.name = this.name;
    spec.domain = {data: this.properties.pipeline.name, field: this.properties.field.spec()};
    spec.range = this.properties.range.spec();
    delete spec.pipeline;
    delete spec.field;

    return spec;
  };

  prototype.def = function() {
    var groupDef = this.group.def();
    for(var i = 0; i < groupDef.scales.length; i++)
        if(groupDef.scales[i].name == this.name)
            return groupDef.scales[i];

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