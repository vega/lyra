vde.Vis.marks.Line = (function() {
  var line = function(name, groupName) {
    vde.Vis.Mark.call(this, name, groupName);

    this.type = 'line';
    this.propType = 'points';

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

  prototype.spec = function() {
    var propsForType = {
      points: ['x', 'y', 'interpolate', 'tension', 'stroke', 'strokeWidth'],
      path: ['path', 'fill', 'fillOpacity', 'stroke', 'strokeWidth']
    };

    for(var p in this.properties) {
      if(propsForType[this.propType].indexOf(p) == -1)
        delete this.properties[p];
    }

    return vde.Vis.Mark.prototype.spec.call(this);
  };  

  return line;
})();