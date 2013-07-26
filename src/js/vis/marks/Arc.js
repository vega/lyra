vde.Vis.marks.Arc = (function() {
  var arc = function(name, group) {
    vde.Vis.Mark.call(this, name);

    this.type = 'arc';
    this.group = group;

    this.properties = {
      x: {value: 0},
      y: {value: 0},

      startAngle: {value: 0},
      endAngle: {value: 360},
      innerRadius: {value: 0},
      outerRadius: {value: 100},

      fill: {value: '#4682b4'},
      fillOpacity: {value: 1},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0}
    };

    return this.init();
  };

  arc.prototype = new vde.Vis.Mark();
  var prototype  = arc.prototype;

  prototype.spec = function() {
    var spec = vde.Vis.Mark.prototype.spec.call(this);

    // angles are in radians
    var props = spec.properties.enter;
    if(props.startAngle.value)
      props.startAngle.value = props.startAngle.value / 180 * Math.PI;

    if(props.endAngle.value)
    props.endAngle.value = props.endAngle.value / 180 * Math.PI;

    return spec;
  };

  prototype.bindProperty = function(prop, scale, field) {
    switch(prop) {
      case 'innerRadius':
      case 'outerRadius':
        scale = this.pipeline.scale({
          type: 'sqrt',
          field: field
        }, {range: new vde.Vis.Field('width')}, 'radius');
      break;
    }

    return [scale, field];
  };

  return arc;
})();