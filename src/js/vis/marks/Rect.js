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

  prototype.bindProperty = function(prop, opts) {
    this.properties[prop] || (this.properties[prop] = {});

    if(opts.scaleName)
      this.properties[prop].scale = this.pipeline.scales[opts.scaleName];

    if(opts.field) {
      var scale, field = opts.field;
      if(!(field instanceof vde.Vis.Field)) field = new vde.Vis.Field(field);

      switch(prop) {
        case 'x':
        case 'x2':
        case 'width':
          scale = this.pipeline.scale({
            type: 'ordinal',
            field: field
          }, {range: new vde.Vis.Field('width')});
        break;

        case 'y':
        case 'y2':
        case 'height':
          scale = this.pipeline.scale({
            type: 'linear',
            field: field
          }, {range: new vde.Vis.Field('height')});
        break;

        // HERE BE DRAGONS!
        case 'fill':
        case 'stroke':
          scale = this.pipeline.scale({
            type: 'ordinal',
            field: field,
            range: new vde.Vis.Field('category20')
          });          
        break;
      }

      this.properties[prop].scale = scale;
      this.properties[prop].field = field;
    }

    delete this.properties[prop].value;
  };

  return rect;
})();