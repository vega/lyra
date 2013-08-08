vde.Vis.marks.Group = (function() {
  var group = function(name) {
    vde.Vis.Mark.call(this, name || 'group_' + (vg.keys(vde.Vis.groups).length+1));

    this.type   = 'group';
    this.layer  = true;  // A psuedo-group exists in the spec, but not in the VDE UI.

    this.scales = {};
    this.axes   = {};
    this.marks  = {};

    this._spec.scales   = [];
    this._spec.axes   = [];
    this._spec.marks  = [];

    this.properties = {
      x: {value: 0},
      width: {value: vde.Vis.properties.width},
      y: {value: 0},
      height: {value: vde.Vis.properties.height},
      fill: {value: '#ffffff'},
      fillOpacity: {value: 1},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0}
    };

    vde.Vis.groups[this.name] = this;

    return this;
  };

  group.prototype = new vde.Vis.Mark();
  var prototype = group.prototype;

  prototype.spec = function() {
    var self = this;
    var spec = vg.duplicate(vde.Vis.Mark.prototype.spec.call(this));

    vde.Vis.Callback.run('group.pre_spec', this, {spec: spec});

    ['scales', 'axes', 'marks'].forEach(function(t) {
      vg.keys(self[t]).forEach(function(k) {
        var s = self[t][k].spec();
        if(!s) return;
        spec[t].push(s);
      });      
    });

    vde.Vis.Callback.run('group.post_spec', this, {spec: spec});

    return spec;
  };

  prototype.scale = function(mark, spec, defaultSpec, displayName) {
    var scale = mark.pipeline().scale(spec, defaultSpec, displayName);
    this.scales[scale.name] = scale;

    return scale;
  };

  prototype.annotateDef = function() {
    for(var m in this.marks) this.marks[m].def();
  };

  return group;
})();