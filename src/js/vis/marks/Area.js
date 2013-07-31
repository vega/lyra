vde.Vis.marks.Area = (function() {
  var area = function(name, group) {
    vde.Vis.Mark.call(this, name);

    this.type = 'area';
    this.group = group;

    this.properties = {
      x: {value: 0},
      y: {value: 0},
      y2: {value: 0},

      interpolate: {value: 'monotone'},
      tension: {value: 0},

      fill: {value: '#4682b4'},
      fillOpacity: {value: 1},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0}
    };

    return this.init();
  };

  area.prototype = new vde.Vis.Mark();
  var prototype  = area.prototype;

  prototype.productionRules = function(prop, scale, field) {
    switch(prop) {
      case 'y2':
        scale = this.group.scale(this, {
          field: field
        }, {
          type: field.type || 'linear',
          range: new vde.Vis.Field('height')
        }, 'y');
      break;
    }

    return [scale, field];
  };


  return area;
})();