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
      fillOpacity: {value: 1},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0}
    };

    return this.init();
  };

  rect.prototype = new vde.Vis.Mark();
  var prototype  = rect.prototype;

  prototype.bindProperty = function(prop, opts) {
    this.properties[prop] || (this.properties[prop] = {});

    if(opts.scale)
      this.properties[prop].scale = this.group.scale({ name: scale });

    if(opts.field) {
      var scale;

      switch(prop) {
        case 'x':
        case 'x2':
        case 'width':
          scale = this.group.scale({
            type: 'ordinal',
            domain: {data: this.from.data, field: 'data.' + opts.field}
          }, {range: 'width'});
        break;

        case 'y':
        case 'y2':
        case 'height':
          scale = this.group.scale({
            type: 'linear',
            domain: {data: this.from.data, field: 'data.' + opts.field},
          }, {range: 'height'});
        break;
      }

      this.properties[prop].scale = scale;
      this.properties[prop].field = opts.field;
    }

    delete this.properties[prop].value;
  };

  return rect;
})();