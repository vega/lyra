vde.Vis.marks.Rect = (function() {
  var rect = function(name, groupName) {
    vde.Vis.Mark.call(this, name, groupName);

    this.type = 'rect';

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

    this.connectors = {
      'top-left': {}, 'top-center': {}, 'top-right': {},
      'middle-left' : {}, 'middle-center': {}, 'middle-right': {},
      'bottom-left': {}, 'bottom-center': {}, 'bottom-right': {}
    };

    return this.init();
  };

  rect.prototype = new vde.Vis.Mark();
  var prototype  = rect.prototype;
  var geomOffset = 7; // Offset from rect for the interactive geometry

  prototype.productionRules = function(prop, scale, field) {
    if(!scale || scale.field().name != field.name) {
      switch(prop) {
        case 'x':
        case 'x2':
        case 'width':
          scale = this.group().scale(this, {
            field: field
          }, {
            type: field.type || 'ordinal',
            range: new vde.Vis.Field('width')
          }, 'x');
        break;

        case 'y':
        case 'y2':
        case 'height':
          scale = this.group().scale(this, {
            field: field
          }, {
            type: field.type || 'linear',
            range: new vde.Vis.Field('height')
          }, 'y');
        break;
      }
    }

    if(scale.type() == 'ordinal')
      scale.properties.points = false;

    return [scale, field];
  };

  prototype.defaults = function(prop) {
    var props = this.properties;
    // If we set the width/height, by default map x/y
    if(['width', 'height'].indexOf(prop) == -1) return;
    var defaultProp = (prop == 'width') ? 'x' : 'y';
    var otherProps = (prop == 'width') ? ['y', 'y2', 'height'] : ['x', 'x2', 'width'];

    props[defaultProp] = {
      scale: props[prop].scale,
      field: props[prop].field
    };

    if(props[prop].scale.type() == 'ordinal') {
      delete props[prop].field;
      props[prop].value = 'auto';
    } else {
      props[defaultProp+'2'] = {
        scale: props[prop].scale,
        value: 0
      };

      this.unbindProperty(prop);
      props[prop].disabled = true;

      // Check to see if the other property has been assigned
      // if not, assign it to index
      var scaledOther = false;
      otherProps.some(function(o) { return (scaledOther = !!props[o].scale); })
      if(!scaledOther) {
        this.bindProperty(otherProps[2], {
          field: new vde.Vis.Field('index', false, 'ordinal', this.pipelineName),
          pipelineName: this.pipelineName
        }, true);
      }
    }
  };

  prototype.selected = function() {
    var self = this, item = this.item(vde.iVis.activeItem);

    var mousemove = function() {
      var dragging = vde.iVis.dragging, evt = d3.event;
      if(!dragging || !dragging.prev) return;
      if(vde.iVis.activeMark != self) return;

      var props = self.properties,
          dx = Math.ceil(evt.pageX - dragging.prev[0]), 
          dy = Math.ceil(evt.pageY - dragging.prev[1]),
          data = dragging.item.datum.data;

      if(!data || data.disabled) return; 

      // Since we're updating a value, pull the current value from the
      // scenegraph directly rather than properties. This makes it easier
      // to cope with rangeBands and {scale, value} properties.
      var updateValue = function(prop, delta) {
        if(!props[prop].disabled) props[prop] = {value: item[prop] + delta};
      }

      vde.iVis.ngScope().$apply(function() {
        switch(data.connector) {
          case 'top-center':
            var reverse = (props.y.scale && 
              props.y.scale.range().name == 'height') ? -1 : 1;
            
            updateValue('y', dy*reverse);
            updateValue('height', dy*-1);
            self.update(['y', 'y2', 'height']);
          break;

          case 'bottom-center':
            var reverse = (props.y2.scale && 
              props.y2.scale.range().name == 'height') ? -1 : 1;

            updateValue('y2', dy*reverse);
            updateValue('height', dy);
            self.update(['y', 'y2', 'height']);
          break;

          case 'middle-left':
            updateValue('x', dx);
            updateValue('width', dx*-1);
            self.update(['x', 'x2', 'width']);
          break;

          case 'middle-right':
            updateValue('x2', dx);
            updateValue('width', dx);
            self.update(['x', 'x2', 'width']);
          break;
        }
      });

      dragging.prev = [evt.pageX, evt.pageY];
      vde.iVis.show('handle');
    };

    vde.iVis.interactor('handle', this.handles(item), {mousemove: mousemove});
  };  

  prototype.helper = function(property) {
    var item = this.item(vde.iVis.activeItem),
        c = this.connectors, propConnectors = [];
    if(['x', 'x2', 'width', 'y', 'y2', 'height'].indexOf(property) == -1) return;

    switch(property) {
      case 'x': propConnectors = [c['top-left'].coords(item), c['bottom-left'].coords(item)]; break;
      case 'x2': propConnectors = [c['top-right'].coords(item), c['bottom-right'].coords(item)]; break;
      case 'width': propConnectors = [c['top-left'].coords(item), c['top-right'].coords(item)]; break;

      case 'y': propConnectors = [c['top-left'].coords(item), c['top-right'].coords(item)]; break;
      case 'y2': propConnectors = [c['bottom-left'].coords(item), c['bottom-right'].coords(item)]; break;
      case 'height': propConnectors = [c['top-left'].coords(item), c['bottom-left'].coords(item)]; break;
    };

    vde.iVis.interactor('point', propConnectors);
    vde.iVis.interactor('span', this.spans(item, property));
    vde.iVis.show(['point', 'span']);
  };

  prototype.target = function(connector) {
    var self  = this,
        item  = this.item(vde.iVis.activeItem),
        props = [],
        spans = [], dropzones = [];

    var connToSpan = {
      'top-left': {props: ['x', 'y'], span: 0},
      'bottom-right': {props: ['x2', 'y2'], span: 1}
    };

    if(connector) props = connToSpan[connector].props;
    if(props.length == 0) props = ['width', 'height'];

    props.forEach(function(prop) {
      var span = self.spans(item, prop)

      if(connector != null && connToSpan[connector]) 
        span = span.reduce(function(acc, s) { 
          // Offset dropzones for top-left connector to prevent overlaps
          if(connector == 'top-left' && prop == 'x') s.y += 2*geomOffset;
          if(connector == 'top-left' && prop == 'y') s.x += 2*geomOffset;

          if(s.span == prop + '_' + connToSpan[connector].span) acc.push(s);
          return acc;
        }, []);

      dropzones = dropzones.concat(self.dropzones(span));
      spans = spans.concat(span);
    });
    
    var connectors = [this.connectors['top-left'].coords(item), this.connectors['bottom-right'].coords(item)];

    // Order is important with dropzones to ensure on overlap, the connector dropzones
    // take precendence. 
    dropzones = dropzones.concat(connectors.map(function(c) { return self.dropzones(c); }));

    var mouseover = function(e, item) {
      if(!vde.iVis.dragging) return;
      if(item.mark.def.name != 'dropzone') return;

      // On mouseover, highlight the underlying span/connector.
      // For points, switch targets after a timeout.
      if(item.connector) {
        vde.iVis.view.update({
          props: 'hover',
          items: item.mark.group.items[2].items[item.key-2]
        });

        vde.iVis.timeout = window.setTimeout(function() {
          self.target((item.connector == connector) ? '' : item.connector);
        }, 750);
      } else {
        vde.iVis.view.update({
          props: 'hover',
          items: item.cousin(-1).items[0].items
        });

        d3.select('#' + item.property + '.property').classed('drophover', true);
      }
    };

    var mouseout = function(e, item) { 
      if(!vde.iVis.dragging) return;
      if(item.mark.def.name != 'dropzone') return;

      // Clear highlights
      if(item.connector) {
        vde.iVis.view.update({
          props: 'update',
          items: item.mark.group.items[1].items[item.key-2]
        });
      } else {
        vde.iVis.view.update({
          props: 'update',
          items: item.cousin(-1).items[0].items
        });

        d3.select('#' + item.property + '.property').classed('drophover', false);
      }

      // Clear timeout
      window.clearTimeout(vde.iVis.timeout); 
    };

    var mouseup = function(e, item) {
      if(!vde.iVis.dragging) return;
      if(item.mark.def.name != 'dropzone') return;

      if(item.property) vde.iVis.bindProperty(self, item.property, true);

      d3.select('#' + item.property + '.property').classed('drophover', false);
      window.clearTimeout(vde.iVis.timeout); 
    };

    vde.iVis.interactor('point', connectors);
    vde.iVis.interactor('span', spans);
    vde.iVis.interactor('dropzone', dropzones, {
      mouseover: mouseover,
      mouseout: mouseout,
      mouseup: mouseup
    });
    vde.iVis.show(['point', 'span', 'dropzone']);
  };

  prototype.coordinates = function(connector, item, def) {
    if(!item) item = this.item(vde.iVis.activeItem);
    var b = vde.iVis.translatedBounds(item, item.bounds),
        coord = {};

    switch(connector) {
      case 'top-left': coord = {x: b.x1, y: b.y1, cursor: 'nw-resize'}; break;
      case 'top-center': coord = {x: b.x1 + (b.width()/2), y: b.y1, cursor: 'n-resize'}; break;
      case 'top-right': coord = {x: b.x2, y: b.y1, cursor: 'ne-resize'}; break;
      case 'middle-left': coord = {x: b.x1, y: b.y1 + (b.height()/2), cursor: 'w-resize'}; break;
      case 'middle-center': coord = {x: b.x1 + (b.width()/2), y: b.y1 + (b.height()/2), cursor: 'move'}; break;
      case 'middle-right': coord = {x: b.x2, y: b.y1 + (b.height()/2), cursor: 'e-resize'}; break;
      case 'bottom-left': coord = {x: b.x1, y: b.y2, cursor: 'sw-resize'}; break;
      case 'bottom-center': coord = {x: b.x1 + (b.width()/2), y: b.y2, cursor: 's-resize'}; break;
      case 'bottom-right': coord = {x: b.x2, y: b.y2, cursor: 'se-resize'}; break;
    }

    coord.connector = connector;
    for(var k in def) coord[k] = def[k];

    return coord;
  };

  prototype.handles = function(item) {
    var props = this.properties,
        top = this.connectors['top-center'].coords(item, {disabled: 0}),
        bottom = this.connectors['bottom-center'].coords(item, {disabled: 0}),
        left = this.connectors['middle-left'].coords(item, {disabled: 0}),
        right = this.connectors['middle-right'].coords(item, {disabled: 0});

    var checkExtents = function(extents, handles) {
      var count = 0;
      extents.forEach(function(e) { if(props[e].field) count++ });
      if(count > 2) handles.forEach(function(h) { h.disabled = 1; });
    }

    checkExtents(['y', 'y2', 'height'], [top, bottom]);
    if(props.y.field) top.disabled = 1;
    if(props.y2.field) bottom.disabled = 1;
    if(props.width.field) top.disabled = bottom.disabled = 1;
    
    checkExtents(['x', 'x2', 'height'], [left, right]);
    if(props.x.field) left.disabled = 1;
    if(props.x2.field) right.disabled = 1;
    if(props.height.field) left.disabled = right.disabled = 1;

    return [top, bottom, left, right];      
  }; 

  prototype.spans = function(item, property) {
    var props = this.properties,
        b  = vde.iVis.translatedBounds(item, item.bounds),
        gb = vde.iVis.translatedBounds(item.mark.group, item.mark.group.bounds),
        go = 3*geomOffset, io = geomOffset; // offsets

    switch(property) {
      case 'x': 
        return [{x: (gb.x1-go), y: (b.y1-io), span: 'x_0'}, {x: b.x1, y: (b.y1-io), span: 'x_0'},
         {x: (gb.x1-go), y: (b.y2+io), span: 'x_1'}, {x: b.x1, y: (b.y2+io), span: 'x_1'}];
      break;

      case 'x2': 
        return [{x: (gb.x1-go), y: (b.y1-io), span: 'x2_0'}, {x: b.x2, y: (b.y1-io), span: 'x2_0'},
         {x: (gb.x1-go), y: (b.y2+io), span: 'x2_1'}, {x: b.x2, y: (b.y2+io), span: 'x2_1'}];
      break;

      case 'width': return [{x: b.x1, y: (b.y1-io), span: 'width_0'}, {x: b.x2, y: (b.y1-io), span: 'width_0'}]; break;

      case 'y': return (props.y.scale && props.y.scale.range().name == 'height') ?
        [{x: (b.x1-io), y: (gb.y2+go), span: 'y_0'}, {x: (b.x1-io), y: b.y1, span: 'y_0'},
         {x: (b.x2+io), y: (gb.y2+go), span: 'y_1'}, {x: (b.x2+io), y: b.y1, span: 'y_1'}]
      :
        [{x: (b.x1-io), y: (gb.y1-go), span: 'y_0'}, {x: (b.x1-io), y: b.y1, span: 'y_0'},
         {x: (b.x2+io), y: (gb.y1-go), span: 'y_1'}, {x: (b.x2+io), y: b.y1, span: 'y_1'}];
      break;

      case 'y2': return (props.y2.scale && props.y2.scale.range().name == 'height') ?
        [{x: (b.x1-io), y: (gb.y2+go), span: 'y2_0'}, {x: (b.x1-io), y: b.y2, span: 'y2_0'},
         {x: (b.x2+io), y: (gb.y2+go), span: 'y2_1'}, {x: (b.x2+io), y: b.y2, span: 'y2_1'}]
      :
        [{x: (b.x1-io), y: (gb.y1-go), span: 'y2_0'}, {x: (b.x1-io), y: b.y2, span: 'y2_0'},
         {x: (b.x2+io), y: (gb.y1-go), span: 'y2_1'}, {x: (b.x2+io), y: b.y2, span: 'y2_1'}];
      break;

      case 'height': return [{x: (b.x1-io), y: b.y1, span: 'height_0'}, {x: (b.x1-io), y: b.y2, span: 'height_0'}]; break;
    };
  };

  return rect;
})();