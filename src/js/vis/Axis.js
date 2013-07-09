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
    var spec = {}, self = this;
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
      axesStyle: vg.duplicate(this.properties.axesStyle)
    };

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
    if(!opts.scaleName) return; // Because this makes no sense

    this.properties[prop] = this.group.scales[opts.scaleName];
  };

  return axis;
})();