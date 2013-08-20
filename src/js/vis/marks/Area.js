vde.Vis.marks.Area = (function() {
  var area = function(name, groupName) {
    vde.Vis.Mark.call(this, name, groupName);

    this.type = 'area';

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

    vde.Vis.callback.register('vis.post_spec', this, function(opts) {
      return vde.Vis.marks.Line.prototype.dummyData.call(this, opts);
    });

    return this.init();
  };

  area.prototype = new vde.Vis.Mark();
  var prototype  = area.prototype;

  prototype.spec = function() {
    vde.Vis.marks.Line.prototype.dummySpec.call(this);
    return vde.Vis.Mark.prototype.spec.call(this);
  };

  prototype.productionRules = function(prop, scale, field) {
    if(!scale) {
      switch(prop) {
        case 'y2':
          scale = this.group().scale(this, {
            field: field
          }, {
            type: field.type || 'linear',
            range: new vde.Vis.Field('height')
          }, 'y');
        break;
      }      
    }

    return [scale, field];
  };

  return area;
})();