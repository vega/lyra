vde.Vis.marks.Rect = (function() {
  var rect = function(name, group) {
    vde.Vis.Mark.call(this, name);

    this.type = 'rect';
    this.group = group;

    this.properties = {
      x: {value: 0},
      width: {value: 15},
      x2: {value: 0, disabled: true},
      y: {value: 0},
      height: {value: 150},
      y2: {value: 0, disabled: true},
      fill: {value: '#4682b4'},
      fillOpacity: {value: 1},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0}
    };

    this.extents = {
      horizontal: {fields: ['x', 'x2', 'width'], limit: 2, history: ['x', 'width']},
      vertical: {fields: ['y', 'y2', 'height'],  limit: 2, history: ['y', 'height']}
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