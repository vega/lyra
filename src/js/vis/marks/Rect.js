vde.Vis.marks.Rect = (function() {
  var rect = function(name, group) {
    vde.Vis.Mark.call(this, name);

    this.type = 'rect';
    this.group = group;

    this.properties = {
      x: {value: 0},
      width: {value: 50},
      y: {value: 0},
      height: {value: 150},
      fill: {value: '#4682b4'},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0}
    };

    return this.init();
  };

  rect.prototype = new vde.Vis.Mark();
  var prototype  = rect.prototype;

  prototype.spec = function() {
    var spec = vg.duplicate(vde.Vis.Mark.prototype.spec.call(this));
    spec.properties.enter = this.properties;
    spec.properties.update = this.properties;
    return spec;
  };

  return rect;
})();