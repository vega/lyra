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

    vde.Vis.callback.register('vis.post_spec', this, this.dummyData);

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

    this.dummySpec();

    return vde.Vis.Mark.prototype.spec.call(this);
  }; 

  prototype.dummySpec = function() {
    if(!this.properties.x.field && !this.properties.y.field) {
      this._spec.from = {data: 'vdeDummyData'};
      this._spec.properties.enter = {
        x: {field: 'data.x'},
        y: {field: 'data.y'},
        y2: {value: this.group().properties.height.value}
      };
    } else {
      this._spec.from = {};
      this._spec.properties.enter = {};
    }
  };

  prototype.dummyData = function(opts) {
    if(this.properties.x.field || this.properties.y.field) return;
    var g = this.group().properties;

    opts.spec.data.push({
      name: 'vdeDummyData',
      values: [{x: 0, y: (g.height.value / 2) + 50}, 
        {x: (g.width.value/2) + 50, y: 0}]
    });
  };

  return line;
})();