vde.Vis.marks.Text = (function() {
  var text = function(name, groupName) {
    vde.Vis.Mark.call(this, name, groupName);

    this.type = 'text';

    this.properties = {
      x: {value: 0},
      y: {value: 0},

      text: null,
      textFormula: '"Text"',
      textFormulaHtml: 'Text',

      align: {value: 'center'},
      baseline: {value: 'middle'},
      dx: {value: 0, offset: 0},
      dy: {value: 0, offset: 0},
      angle: {value: 0},
      font: {value: 'Helvetica'},
      fontSize: {value: 12},
      fontWeight: {value: 'normal'},
      fontStyle: {value: 'normal'},

      fill: {value: '#4682b4'}
    };

    this.connectors = {
      'text': {},
      'left': {}, 'right': {}
    };

    return this;
  };

  text.prototype = new vde.Vis.Mark();
  var prototype  = text.prototype;
  var geomOffset = 7;

  prototype.formulaName = function() {
    return 'vdeTextFormula_' + this.group().name + '_' + this.name;
  };

  prototype.from = function() {
    return {transform: [{
      type: 'formula',
      field: this.formulaName(),
      expr: this.properties.textFormula
    }]};
  };

  prototype.spec = function() {
    this._spec.from = this.from();
    this.properties.text = {field: new vde.Vis.Field(this.formulaName())};
    return vde.Vis.Mark.prototype.spec.call(this);
  };

  prototype.update = function(prop) {
    if(prop.indexOf('text') != -1) {
      var def = this.def();

      // Copied from vg.parse.parse
      var name = this.pipelineName,
          tx = vg.parse.dataflow(this.from());
      def.from = function(db, group, parentData) {
        var data = vg.scene.data(name ? db[name] : null, parentData);
        return tx(data, db, group);
      };
    }

    return vde.Vis.Mark.prototype.update.call(this, prop);
  }

  prototype.productionRules = function(prop, scale, field) {
    if(prop == 'text') {
      var schema = $('<div class="schema" contenteditable="false">' + field.name + '</div>')
          .attr('field-spec', (field instanceof vde.Vis.Field) ? field.spec() : null)
          .toggleClass('raw',     field.raw)
          .toggleClass('derived', !field.raw);

      this.properties.textFormula = 'd.' + field.spec();
      this.properties.textFormulaHtml = $('<div>').append(schema).html();

      scale = field = null;
    }

    return [scale, field];
  };

  prototype.checkExtents = function(prop) {
    var p = this.properties;

    // if(p.align.value == 'center') p.dx.disabled = true;
    // else delete p.dx.disabled;

    // if(p.baseline.value == 'middle') p.dy.disabled = true;
    // else delete p.dy.disabled;
  };

  prototype.selected = function() {
    var self = this,
        item = this.item(vde.iVis.activeItem),
        props = this.properties, conn = this.connectedTo,
        connector = null, connections = [];

    var mousemove = function() {
      var dragging = vde.iVis.dragging, evt = d3.event;
      if(!dragging || !dragging.prev) return;
      if(vde.iVis.activeMark != self) return;

      var handle = (dragging.item.mark.def.name == 'handle'),
          dx = Math.ceil(evt.pageX - dragging.prev[0]),
          dy = Math.ceil(evt.pageY - dragging.prev[1]),
          data = dragging.item.datum.data;

      vde.iVis.ngScope().$apply(function() {
        if(handle) {
          if(evt.metaKey && !props.angle.field) { // Rotate
            var b  = vde.iVis.translatedBounds(item, item.bounds),
                o  = $('#vis canvas').offset(),
                cx = b.x1 + b.width()/2,
                cy = b.y1 + b.height()/2;

            var rad = Math.atan2(evt.pageX - (o.left + cx), evt.pageY - (o.top + cy));
            var deg = (rad * (180 / Math.PI) * -1) + 90;
            props.angle.value = Math.round(deg);
            self.update('angle');
          } else {
            var ds = Math.sqrt(dx*dx + dy*dy);
            if((data.connector == 'left' && (dx > 0 || dy > 0)) ||
              (data.connector == 'right' && (dx < 0 || dy < 0))) ds*=-1;
            props.fontSize.value = Math.round(props.fontSize.value + ds/5);
            if(props.fontSize.value < 1) props.fontSize.value = 1;
            self.update('fontSize');
          }
        } else {
          if(self.connectedTo.host) {
            props.dx.offset += dx;
            props.dy.offset += dy;

            self.update(['dx', 'dy']);
          } else {
            if(!props.x.field) props.x.value += dx;
            if(!props.y.field) props.y.value += dy;

            self.update(['x', 'y']);
          }
        }
      });

      dragging.prev = [evt.pageX, evt.pageY];
      vde.iVis.show('selected');
    };

    var keydown = function() {
      var e = d3.event;
      if(vde.iVis.activeMark != self) return;
      if(!e.metaKey) return;

      vde.iVis.ngScope().$apply(function() {
        switch(e.keyCode) {
          case 66: // b
            props.fontWeight.value = (props.fontWeight.value == 'normal') ? 'bold' : 'normal';
          break;

          case 73: // i
            props.fontStyle.value = (props.fontStyle.value == 'normal') ? 'italic' : 'normal';
          break;
        }

        self.update(['fontWeight', 'fontStyle']);
      });
    };

    if(conn.host) {
      // Because they're connected, we should be able to look up the host item
      var hostItem  = conn.host.item(vde.iVis.activeItem);
      connector = conn.host.connectors[conn.connector].coords(hostItem, {connected: 1});
    }

    return {
      interactors: {
        handle: this.handles(item),
        connector: connector ? [connector] : [],
        connection: this.spans(item, 'connection')
      },
      evtHandlers: {mousemove: mousemove, keydown: keydown}
    };
  };

  prototype.helper = function(property) {
    var item = this.item(vde.iVis.activeItem);
    if(['x', 'y', 'dx', 'dy'].indexOf(property) == -1) return;

    vde.iVis.interactor('point', [this.connectors['text'].coords(item)])
      .interactor('span', this.spans(item, property))
      .show(['point', 'span']);
  };

  prototype.propertyTargets = function() {
    var self = this,
        item = this.item(vde.iVis.activeItem),
        spans = [], dropzones = [];

    if(!this.connectedTo.host) {
      ['x', 'y'].forEach(function(p) {
        var s = self.spans(item, p);
        dropzones = dropzones.concat(self.dropzones(s));
        spans = spans.concat(s);
      });
    }

    var connectors = [this.connectors['text'].coords(item)];
    connectors[0].property = 'text';
    dropzones = dropzones.concat(connectors.map(function(c) { return self.dropzones(c); }));

    vde.iVis.interactor('point', connectors)
      .interactor('span', spans)
      .interactor('dropzone', dropzones)
      .show(['point', 'span', 'dropzone']);
  };

  prototype.coordinates = function(connector, item, def) {
    if(!item) item = this.item(vde.iVis.activeItem);
    var coord = {};

    if(connector == 'text') {
      var b  = vde.iVis.translatedBounds(item,
          new vg.Bounds({x1: item.x, x2: item.x, y1: item.y, y2: item.y}));
      coord = {x: b.x1, y: b.y1, cursor: 'move'};

      if(this.connectedTo.host) { coord.x += item.dx; coord.y += item.dy; }
    } else {
      var b = new vg.Bounds();
      vg.scene.bounds.text(item, b, true);  // Calculate text bounds w/o rotating
      b.rotate(item.angle*Math.PI/180, item.x||0, item.y||0);
      b = vde.iVis.translatedBounds(item, b);

      coord = (connector == 'left') ?
        {x: b.x1, y: b.y1, cursor: 'nw-resize'} : {x: b.x2, y: b.y2, cursor: 'se-resize'};
    }

    coord.connector = connector;
    for(var k in def) coord[k] = def[k];

    return coord;
  };

  prototype.handles = function(item) {
    var props = this.properties,
        b = vde.iVis.translatedBounds(item, item.bounds),
        left = this.connectors.left.coords(item, {disabled: 0}),
        right = this.connectors.right.coords(item, {disabled: 0});

    return [left, right];
  };

  prototype.spans = function(item, property) {
    var props = this.properties,
        b  = vde.iVis.translatedBounds(item, item.bounds),
        gb = vde.iVis.translatedBounds(item.mark.group, item.mark.group.bounds),
        go = 3*geomOffset, io = geomOffset,
        pt = this.connectors['text'].coords(item),
        dx = item.dx, dy = item.dy; // offsets

    switch(property) {
      case 'x':
        return [{x: (gb.x1-go), y: (pt.y+io), span: 'x_0'}, {x: pt.x, y: (pt.y+io), span: 'x_0'}];
      break;

      case 'y': return (props.y.scale && props.y.scale.range().name == 'height') ?
        [{x: (pt.x+io), y: (gb.y2+go), span: 'y_0'}, {x: (pt.x+io), y: (pt.y), span: 'y_0'}]
      :
        [{x: (pt.x+io), y: (gb.y1-go), span: 'y_0'}, {x: (pt.x+io), y: (pt.y), span: 'y_0'}]
      break;

      case 'dx':
        return [{x: pt.x, y: (pt.y+io), span: 'dx_0'}, {x: pt.x + dx, y: (pt.y+io), span: 'dx_0'}];
      break;

      case 'dy':
        return [{x: (pt.x+io), y: pt.y, span: 'dy_0'}, {x: (pt.x+io), y: (pt.y+dy), span: 'dy_0'}];
      break;

      case 'connection':
        if(!this.connectedTo.host) return [];
        var conn = this.connectedTo;
        var hostItem = conn.host.item(vde.iVis.activeItem);
        var connector = conn.host.connectors[conn.connector].coords(hostItem);
        var textConnector = this.connectors.text.coords(item);
        return [{x: connector.x, y: connector.y, span: 'connection_0'}, {x: textConnector.x, y: textConnector.y, span: 'connection_0'}];
      break;
    }
  };

  return text;
})();
