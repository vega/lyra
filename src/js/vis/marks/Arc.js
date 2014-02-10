vde.Vis.marks.Arc = (function() {
  var arc = function(name, layerName, groupName) {
    vde.Vis.Mark.call(this, name, layerName, groupName);

    this.type = 'arc';

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

    return this;
  };

  arc.prototype = new vde.Vis.Mark();
  var prototype  = arc.prototype;

  prototype.spec = function() {
    var spec = this._spec;

    // angles are in radians
    var props = this.properties;
    if(!props.startAngle.field) {
      spec.startAngle || (spec.startAngle = {});
      spec.startAngle.value = props.startAngle.value / 180 * Math.PI;
    }

    if(!props.endAngle.field) {
      spec.endAngle || (spec.endAngle = {});
      spec.endAngle.value = props.endAngle.value / 180 * Math.PI;
    }

    return vde.Vis.Mark.prototype.spec.call(this);
  };

  prototype.productionRules = function(prop, scale, field) {
    if(!scale) {
      switch(prop) {
        case 'innerRadius':
        case 'outerRadius':
          scale = this.group().scale(this, {
            domainTypes: {from: 'field'},
            domainField: field,
            rangeTypes: {type: 'other', property: prop}
          }, {
            properties: {type: 'sqrt'},
            rangeTypes: {type: 'other', from: 'values', property: prop},
            rangeValues: (prop == 'innerRadius') ? [0, 50] : [0, 100]
          }, prop);

        break;
      }
    }

    return [scale, field];
  };

  return arc;
})();
