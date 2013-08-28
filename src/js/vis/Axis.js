vde.Vis.Axis = (function() {
  var axis = function(name, groupName) {
    this.name  = name;

    this.properties = {
      type: null,
      orient: null,
      scale: null,
      title: null,
      layer: 'back',

      ticks: 10,
      tickSize: 6,
      tickStyle: {},

      labelStyle: {
        fontSize: {value: 10},
        font: {value: "Helvetica"},
        angle: {value: 0}
      },

      axisStyle: {},

      gridStyle: {}
    };

    this.groupName = groupName;
    this.pipelineName = null;

    return this.init();
  };

  var prototype = axis.prototype;

  prototype.init = function() {
    if(!this.name)
      this.name = 'axis_' + (vg.keys(this.group().axes).length+1);

    this.group().axes[this.name] = this;

    return this;
  };

  prototype.spec = function() {
    var spec = {}, self = this;
    if(!this.properties.scale) return;

    if(!this.properties.title) {
      var inflector = vde.iVis.ngFilter()('inflector');
      this.properties.title = inflector(this.properties.scale.field().name);
    }

    vde.Vis.callback.run('axis.pre_spec', this, {spec: spec});

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
      axis: vg.duplicate(this.properties.axisStyle),
      grid: vg.duplicate(this.properties.gridStyle)
    };

    vde.Vis.callback.run('axis.post_spec', this, {spec: spec});

    this.properties.scale.hasAxis = true;

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

  prototype.group = function() {
    return vde.Vis.groups[this.groupName];
  };

  prototype.bindProperty = function(prop, opts) {
    if(!opts.scaleName) return; // Because this makes no sense

    this.pipelineName = opts.pipelineName;
    this.properties[prop] = this.pipeline().scales[opts.scaleName];
  };

  prototype.unbindProperty = function(prop) {
    delete this.properties[prop];
  };

  prototype.selected = function() { return {}; }

  return axis;
})();
