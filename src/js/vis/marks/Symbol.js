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

  prototype.bindProperty = function(prop, opts) {
    this.properties[prop] || (this.properties[prop] = {});

    if(opts.scale)
      this.properties[prop].scale = this.group.scale({ name: scaleName });

    if(opts.field) {
      var scale, field = new vde.Vis.Field(opts.field);

      switch(prop) {
        case 'x':
          scale = this.group.scale({
            type: 'ordinal',
            pipeline: this.pipeline,
            field: field
          }, {range: new vde.Vis.Field('width')});
        break;

        case 'y':
          scale = this.group.scale({
            type: 'linear',
            pipeline: this.pipeline, 
            field: field,
          }, {range: new vde.Vis.Field('height')});
        break;

        case 'size':
          scale = this.group.scale({
            type: 'linear',
            pipeline: this.pipeline, 
            field: field
          }, {range: [50, 1000]});
        break;
      }

      this.properties[prop].scale = scale;
      this.properties[prop].field = field;
    }

    delete this.properties[prop].value;
  };

  return symbol;
})();