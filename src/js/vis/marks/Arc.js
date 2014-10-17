vde.Vis.marks.Arc = (function() {
  var arc = function(name, layerName, groupName) {
    vde.Vis.Mark.call(this, name, layerName, groupName);

    this.type = 'arc';

    this.properties = {
      x: {value: 0},
      y: {value: 0},

      startAngle: {value: -30},
      endAngle: {value: 60},
      innerRadius: {value: 0},
      outerRadius: {value: 100},

      fill: {value: '#4682b4'},
      fillOpacity: {value: 1},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0.25}
    };

    this.connectors = {
      'point': {}, 'pie': {}
    };

    return this;
  };

  arc.prototype = new vde.Vis.Mark();
  var prototype  = arc.prototype;

  prototype.property = function(prop) {
    if(prop == 'startAngle' || prop == 'endAngle') {
      var newProp = vg.duplicate(this.properties[prop]);
      if(newProp.field) return vde.Vis.parseProperty(this.properties, prop);
      newProp.value = newProp.value / 180 * Math.PI;
      return newProp;
    }

    return vde.Vis.parseProperty(this.properties, prop);
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

  prototype.bindProperty = function(prop, opts, defaults) {
    if(prop !== 'pie') {
      return vde.Vis.Mark.prototype.bindProperty.call(this, prop, opts, defaults);
    } else {
      if(!opts.pipelineName || !opts.field) return;
      var pipeline = vde.Vis.pipelines[opts.pipelineName],
          pie = null;

      // TODO: replace with Harmony [].find?
      pipeline.transforms.some(function(t) {
        if(t.type === 'pie') return pie = t;
        return false;
      });

      if(!pie) {
        pie = new vde.Vis.transforms.Pie(opts.pipelineName);
        pipeline.addTransform(pie);
      }

      pie.bindProperty('value', opts);
      this.bindProperty('startAngle', {field:pie.output.startAngle});
      this.bindProperty('endAngle', {field:pie.output.endAngle});
    }

  };

  var geomOffset = 7;
  prototype.spans = function(item, property) {
    var props = this.properties,
        b  = vde.iVis.translatedBounds(item, item.bounds),
        gb = vde.iVis.translatedBounds(item.mark.group, item.mark.group.bounds),
        go = 3*geomOffset, io = geomOffset,
        pt = this.connectors['point'].coords(item); // offsets

    switch(property) {
      case 'x':
        return [{x: (gb.x1-go), y: (pt.y+io), span: 'x_0'}, {x: pt.x, y: (pt.y+io), span: 'x_0'}];

      case 'y':
        return (props.y.scale && props.y.scale.range().name == 'height') ?
          [{x: (pt.x+io), y: (gb.y2+go), span: 'y_0'}, {x: (pt.x+io), y: (pt.y), span: 'y_0'}]
        :
          [{x: (pt.x+io), y: (gb.y1-go), span: 'y_0'}, {x: (pt.x+io), y: (pt.y), span: 'y_0'}];
    }
  };

  prototype.propertyTargets = function(connector, showGroup) {
    var self = this,
        item = this.item(vde.iVis.activeItem),
        spans = [], dropzones = [];

    ['x', 'y'].forEach(function(p) {
      var s = self.spans(item, p);

      dropzones = dropzones.concat(self.dropzones(s));
      spans = spans.concat(s);
    });

    if(showGroup) {
      var groupInteractors = this.group().propertyTargets();
      if(groupInteractors.spans) spans = spans.concat(groupInteractors.spans);
      if(groupInteractors.dropzones) dropzones = dropzones.concat(groupInteractors.dropzones);
    }

    var pie = this.connectors['pie'].coords(item);
    pie.startAngle = item.startAngle;
    pie.endAngle = item.endAngle;
    pie.outerRadius = item.outerRadius;
    pie.property = 'pie';

    vde.iVis.interactor('pie', [pie])
      .interactor('span', spans)
      .interactor('dropzone', dropzones)
      .show(['point', 'span', 'dropzone', 'pie']);
  };


  prototype.selected = function() {
    /*var startPoint = {
      x: item.outerRadius * Math.sin(item.startAngle),
      y: -item.outerRadius * Math.cos(item.startAngle)
    };
    var endPoint = {
      x: item.outerRadius * Math.sin(item.endAngle),
      y: -item.outerRadius * Math.cos(item.endAngle)
    };*/

    var self = this, item = this.item(vde.iVis.activeItem),
        props = this.properties;

    var mousemove = function() {
      var dragging = vde.iVis.dragging, evt = d3.event;
      if(!dragging || !dragging.prev) return;
      if(vde.iVis.activeMark != self) return;

      var dx = Math.ceil(evt.pageX - dragging.prev[0]),
          dy = Math.ceil(evt.pageY - dragging.prev[1]),
          data = dragging.item.datum.data;

      if(!data || data.disabled) return;

      vde.iVis.ngScope().$apply(function() {
        props.x.value += dx;
        props.y.value += dy;
        self.update(['x', 'y']);
        self.iVisUpdated = true;
      });

      dragging.prev = [evt.pageX, evt.pageY];
      vde.iVis.show('selected');
    };

    var mouseup = function() {
      if(self.iVisUpdated) {
        vde.iVis.ngScope().$apply(function() {
          vde.iVis.ngTimeline().save();
        });
      }
    };

    return {
      interactors: {
        handle: [this.connectors.point.coords(item, {})]
      },
      evtHandlers: {mousemove: mousemove, mouseup: mouseup}
    };
  };

  prototype.coordinates = function(connector, item, def) {
    if(!item) item = this.item(vde.iVis.activeItem);
    if(!item) return {x: 0, y: 0};  // If we've filtered everything out.
    var b = new vg.Bounds().set(item.x, item.y, item.x, item.y);
    b = vde.iVis.translatedBounds(item, b);

    var coord = {x: b.x1, y: b.y1, connector: connector, small: b.width() < 20 || b.height() < 20};

    for(var k in def) coord[k] = def[k];

    return coord;
  };

  return arc;
})();
