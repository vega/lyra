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
      this.properties[prop].scale = this.group.scale({ name: scale });

    if(opts.field) {
      var scale;

      switch(prop) {
        case 'x':
          scale = this.group.scale({
            type: 'ordinal',
            data: this.from.data,
            field: opts.field
          }, {range: 'width'});
        break;

        case 'y':
          scale = this.group.scale({
            type: 'linear',
            data: this.from.data, 
            field: opts.field,
          }, {range: 'height'});
        break;

        case 'size':
          scale = this.group.scale({
            type: 'linear',
            data: this.from.data, 
            field: opts.field
          }, {range: [50, 1000]});
        break;
      }

      this.properties[prop].scale = scale;
      this.properties[prop].field = opts.field;
    }

    delete this.properties[prop].value;
  };

  return symbol;
})();