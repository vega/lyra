vde.Vis.Axis = (function() {
  var axis = function(name, group) {
    this.name  = (name || 'axis_' + (vg.keys(group.axes).length+1));

    this.properties = {
      tickStyle: {},
      labelStyle: {
        fontSize: {value: 10},
        font: {value: "Helvetica"},
        angle: {value: 0}
      },
      axisStyle: {}
    };

    this.group = group;
    this.pipeline = null;
    this.group.axes[this.name] = this;

    return this;
  };

  var prototype = axis.prototype;

  prototype.spec = function() {
    var spec = {}, self = this;
    if(!this.properties.scale) return;

    vde.Vis.Callback.run('axis.pre_spec', this, {spec: spec});

    vg.keys(this.properties).forEach(function(k) {
      var p = self.properties[k];
      if(p == undefined) return;

      if(k == 'scale') spec[k] = p.name;
      else if(k.indexOf('Style') != -1) return;
      else spec[k] = p;
    });

    spec.properties = {
      ticks: vg.duplicate(this.properties.tickStyle),
      labels: vg.duplicate(this.properties.labelStyle),
      axis: vg.duplicate(this.properties.axisStyle)
    };

    vde.Vis.Callback.run('axis.post_spec', this, {spec: spec});

    return spec;
  };

  prototype.def = function() {
    var groupDef = this.group.def();
    for(var i = 0; i < groupDef.axes.length; i++)
        if(groupDef.axes[i].name == this.name)
            return groupDef.axes[i];

    return null;
  };

  prototype.pipeline = function() {
    return vde.Vis.pipelines[this.pipelineName];
  };

  prototype.bindProperty = function(prop, opts) {
    if(!opts.scaleName) return; // Because this makes no sense

    this.pipelineName = opts.pipelineName;
    this.properties[prop] = this.pipeline().scales[opts.scaleName];
  };

  prototype.unbindProperty = function(prop) {
    delete this.properties[prop];
  };

  return axis;
})();