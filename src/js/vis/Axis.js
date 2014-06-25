vde.Vis.Axis = (function() {
  var axis = function(name, layerName, groupName) {
    this.name  = name;

    this.properties = {
      type: null,
      orient: null,
      scale: null,
      title: null,
      layer: 'back',

      ticks: vg.config.axis.ticks,
      tickSize: vg.config.axis.tickSize,
      tickStyle: {
        stroke: {value: vg.config.axis.tickColor},
        strokeWidth: {value: vg.config.axis.tickWidth}
      },

      labelStyle: {
//        text: {},
        fontSize: {value: vg.config.axis.tickLabelFontSize},
        font: {value: "Helvetica"},
        angle: {value: 0},
        fill: {value: vg.config.axis.tickLabelColor}
      },

      axisStyle: {
        stroke: {value: vg.config.axis.axisColor},
        strokeWidth: {value: vg.config.axis.axisWidth}
      },

      titleOffset: vg.config.axis.titleOffset,
      titleStyle: {
        font: {value: "Helvetica"},
        fontSize: {value: vg.config.axis.titleFontSize},
        fontWeight: {value: vg.config.axis.titleFontWeight},
        fill: {value: vg.config.axis.titleColor}
      },

      gridStyle: {
        stroke: {value: vg.config.axis.gridColor},
        strokeWidth: {value: 1}
      }
    };

    this.showTitle = true;
    this.onceAcrossForks = false;

    this.layerName = layerName;
    this.groupName = groupName;
    this.pipelineName = null;

    return this.init();
  };

  var prototype = axis.prototype;

  prototype.init = function() {
    var count = this.group()._axisCount++;
    if(!this.group().isLayer()) count = this.group().group()._axisCount++;

    if(!this.name)
      this.name = 'axis_' + Date.now();

    this.displayName = 'Axis ' + vde.Vis.codename(count);

    this.group().axes[this.name] = this;

    return this;
  };

  prototype.destroy = function() { return null; };

  prototype.spec = function() {
    var spec = {}, self = this;
    if(!this.properties.scale || !this.properties.scale.field()) return;

    if(!this.properties.title) {
      var inflector = vde.iVis.ngFilter()('inflector');
      this.properties.title = inflector(this.properties.scale.field().name);
    }

    vde.Vis.callback.run('axis.pre_spec', this, {spec: spec});

    vg.keys(this.properties).forEach(function(k) {
      var p = self.properties[k];
      if(p === undefined || p === null) return;

      if(k == 'scale') { spec[k] = p.name; p.used = true; }
      else if(k.indexOf('Style') != -1) return;
      else spec[k] = p;
    });

    if(!this.showTitle) delete spec.title;

    if(spec.tickValues && this.values) {
      spec.values = vg.duplicate(this.values);
      delete spec.tickValues;
    }

    spec.properties = {
      ticks: vg.duplicate(this.properties.tickStyle),
      labels: vg.duplicate(this.properties.labelStyle),
      title: vg.duplicate(this.properties.titleStyle),
      axis: vg.duplicate(this.properties.axisStyle),
      grid: vg.duplicate(this.properties.gridStyle)
    };

    if(spec.properties.labels.text &&
        Object.keys(spec.properties.labels.text).length === 0)
      delete spec.properties.labels.text;

    if(spec.properties.labels.text && spec.properties.labels.text.scale)
      spec.properties.labels.text.scale = spec.properties.labels.text.scale.name;

    vde.Vis.callback.run('axis.post_spec', this, {spec: spec});

    this.properties.scale.hasAxis = true;

    return spec.scale ? spec : null;
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
    var layer = vde.Vis.groups[this.layerName];
    return this.groupName ? layer.marks[this.groupName] : layer;
  };

  prototype.bindProperty = function(prop, opts) {
    if(!opts.scaleName) return; // Because this makes no sense

    this.pipelineName = opts.pipelineName;
    var p = this.properties, props = prop.split('.');
    for(var i = 0; i < props.length - 1; i++) p = p[props[i]];

    var s = this.group().scales[opts.scaleName];
    if(!s) {
      this.group().scales[opts.scaleName] = this.pipeline().scales[opts.scaleName];
      s = this.group().scales[opts.scaleName];
    }

    p[props[props.length-1]] = s;
  };

  prototype.unbindProperty = function(prop) {
    delete this.properties[prop];
  };

  prototype.selected = function() { return {}; };

  prototype.import = function(imp) {
    // Force an assignment of these two in case groupName is null.
    this.groupName = imp.groupName;
    this.layerName = imp.layerName;
  };

  return axis;
})();
