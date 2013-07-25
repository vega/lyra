vde.Vis.marks.Rect = (function() {
  var rect = function(name, group) {
    vde.Vis.Mark.call(this, name);

    this.type = 'rect';
    this.group = group;

    this.properties = {
      x: {value: 0},
      width: {value: 15},
      y: {value: 0},
      height: {value: 150},
      fill: {value: '#4682b4'},
      fillOpacity: {value: 1},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0}
    };

    return this.init();
  };

  rect.prototype = new vde.Vis.Mark();
  var prototype  = rect.prototype;

  prototype.productionRules = function(prop, scale, field) {
    switch(prop) {
      case 'x':
      case 'x2':
      case 'width':
        scale = this.pipeline.scale({
          type: field.type || 'ordinal',
          field: field
        }, {range: new vde.Vis.Field('width')});
      break;

      case 'y':
      case 'y2':
      case 'height':
        scale = this.pipeline.scale({
          type: field.type || 'linear',
          field: field
        }, {range: new vde.Vis.Field('height')});
      break;
    }

    return [scale, field]
  };

  return rect;
})();