vde.Vis.marks.Group = (function() {
  var group = function(name) {
    vde.Vis.Mark.call(this, name || 'group_' + (vg.keys(vde.Vis.groups).length+1));

    this.type   = 'group';
    this.layer  = true;  // A psuedo-group exists in the spec, but not in the VDE UI.

    this.axes   = {};
    this.marks  = {};

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

    vg.keys(this.scales).forEach(function(k) { spec.scales.push(self.scales[k].spec()); });
    vg.keys(this.axes).forEach(function(k)   { spec.axes.push(self.axes[k].spec()); });
    vg.keys(this.marks).forEach(function(k)  { spec.marks.push(self.marks[k].spec()); });

    return spec;
  };

  return group;
})();