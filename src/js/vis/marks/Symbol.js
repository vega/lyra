vde.Vis.marks.Symbol = (function() {
  var symbol = function(name, group) {
    vde.Vis.Mark.call(this, name);

    this.type = 'symbol';
    this.group = group;

    this.properties = {
      x: {value: 0},
      y: {value: 0},

      size: {value: 100},
      shape: {value: 'cross'},

      fill: {value: '#4682b4'},
      fillOpacity: {value: 1},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0}
    };

    return this.init();
  };

  symbol.prototype = new vde.Vis.Mark();
  var prototype  = symbol.prototype;

  prototype.productionRules = function(prop, scale, field) {
    switch(prop) {
      case 'x':
        scale = this.group.scale(this, {
          field: field
        }, {
          type: field.type || 'ordinal',
          range: new vde.Vis.Field('width')
        }, 'x');
      break;

      case 'y':
        scale = this.group.scale(this, {
          field: field,
        }, {
          type: field.type || 'linear',
          range: new vde.Vis.Field('height')
        }, 'y');
      break;

      case 'size':
        scale = this.group.scale(this, {
          type: 'linear',
          pipeline: this.pipeline, 
          field: field
        }, {range: [50, 1000]}, 'size');
      break;
    }

    return [scale, field];
  };

  return symbol;
})();