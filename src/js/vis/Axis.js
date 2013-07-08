vde.Vis.Axis = (function() {
  var axis = function(name, group) {
    this.name  = (name || 'axis_' + (vg.keys(group.axes).length+1));

    this.properties = {
      tickStyle: {},
      labelStyle: {},
      axesStyle: {}
    };

    this.group = group;
    this.group.axes[this.name] = this;

    return this;
  };

  var prototype = axis.prototype;

  prototype.spec = function() {
    var spec = vg.duplicate(this.properties);
    spec.scale = spec.scale.name;
    spec.properties = {
      ticks: vg.duplicate(spec.tickStyle),
      labels: vg.duplicate(spec.labelStyle),
      axesStyle: vg.duplicate(spec.axesStyle)
    };
    delete spec.tickStyle;
    delete spec.labelStyle;
    delete spec.axesStyle;

    return spec;
  };

  prototype.def = function() {
    var groupDef = this.group.def();
    for(var i = 0; i < groupDef.axes.length; i++)
        if(groupDef.axes[i].name == this.name)
            return groupDef.axes[i];

    return null;
  };

  prototype.bindProperty = function(prop, opts) {
    if(!opts.scale) return; // Because this makes no sense

    this.properties[prop] = opts.scale;
  };

  return axis;
})();