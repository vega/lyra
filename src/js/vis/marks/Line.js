vde.Vis.marks.Line = (function() {
  var line = function(name, group) {
    vde.Vis.Mark.call(this, name);

    this.type = 'line';
    this.group = group;

    this.properties = {
      x: {value: 0},
      y: {value: 0},

      interpolate: {value: 'monotone'},
      tension: {value: 0},

      stroke: {value: '#000000'},
      strokeWidth: {value: 2}
    };

    return this.init();
  };

  line.prototype = new vde.Vis.Mark();
  var prototype  = line.prototype;

  return line;
})();