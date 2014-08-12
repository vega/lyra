vde.Vis.marks.Rect = (function() {
  var rect = function(name, layerName, groupName) {
    vde.Vis.Mark.call(this, name, layerName, groupName);

    this.type = 'rect';
    this.fillType = 'color'; // color || image

    this.properties = {
      x: {value: 25},
      width: {value: 30},
      x2: {value: 0, disabled: true},
      y: {value: 25},
      height: {value: 30},
      y2: {value: 0, disabled: true},
      fill: {value: '#4682b4'},
      fillOpacity: {value: 1},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0.25},

      // For image marks
      url: {},
      align: {value: 'center'},
      baseline: {value: 'middle'}
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


    this.inferredHints = {};

    return this;
  };

  rect.prototype = new vde.Vis.Mark();
  var prototype  = rect.prototype;
  var geomOffset = 7; // Offset from rect for the interactive geometry

  prototype.spec = function() {
    if(this.fillType == 'image') {
      this._spec.type = 'image';
    } else {
      delete this.properties.url;
      delete this.properties.align;
      delete this.properties.baseline;
    }

    return vde.Vis.Mark.prototype.spec.call(this);
  };

  prototype.productionRules = function(prop, scale, field, defaults) {
    var self = this,
        props = this.extents.horizontal.fields.indexOf(prop) != -1 ?
          this.extents.horizontal.fields : this.extents.vertical.fields;

    // If we're not dropping over a dropzone, don't ever do inference.
    // If we're dropping over a width/height dropzone, wait to infer
    // later on in the bind process.
    if(!defaults || (defaults && (prop == 'width' || prop == 'height')))
      return [scale, field];

    // To ease construction of extents, we try to infer and reuse a scale from
    // existing extent bindings. However, the user can choose to override this
    // inference, in which case bindProperty + productionRules are called again.
    // So, we check to ensure we only infer a scale if we haven't already for this
    // property.
    if(!scale && !this.properties[prop].inferred && props.indexOf(prop) != -1)
      props.some(function(p) {
        if( (scale = self.properties[p].scale) ) {
          self.properties[prop].inferred = true;
          self.inferredHints[prop] = {
            hint: "Lyra inferred this binding and chose to re-use a scale.",
            action: "Create a new scale"
          };
          return true;
        }
      });
    else
      delete this.properties[prop].inferred;

    if(prop == 'url') field.type = 'encoded';
    return [scale, field];
  };

  prototype.defaults = function(prop) {
    var props = this.properties, isOrd = props[prop].scale.type() == 'ordinal';
    // If we set the width/height, by default map x/y
    if(['width', 'height'].indexOf(prop) == -1) return;
    var scaledProp = (prop == 'width') ? isOrd ? 'x' : 'x2' : 'y';
    var zeroProp   = (prop == 'width') ? isOrd ? 'x2' : 'x' : 'y2';

    props[scaledProp] = {
      scale: props[prop].scale,
      field: props[prop].field,
      default: true
    };

    if(isOrd) {
      delete props[prop].field;
      props[prop].value = 'auto';
    } else {
      props[zeroProp] = {
        scale: props[prop].scale,
        value: 0,
        default: true
      };

      this.unbindProperty(prop);
      props[prop].disabled = true;

      // Check to see if the other property has been assigned
      // if not, assign it to index
      // var scaledOther = false;
      // otherProps.some(function(o) { return (scaledOther = !!props[o].scale); })
      // if(!scaledOther) {
      //   this.bindProperty(otherProps[2], {
      //     field: new vde.Vis.Field('index', '', 'ordinal', this.pipelineName),
      //     pipelineName: this.pipelineName
      //   }, true);
      // }
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
          data = dragging.item.datum.data,
          handle = (dragging.item.mark.def.name == 'handle');

      // Since we're updating a value, pull the current value from the
      // scenegraph directly rather than properties. This makes it easier
      // to cope with rangeBands and {scale, value} properties.
      var updateValue = function(prop, delta) {
        if(!props[prop].disabled && !props[prop].field) {
          props[prop] = {value: item[prop] + delta};
          self.iVisUpdated = true;
        }
      };

      delete self.iVisUpdated;

      vde.iVis.ngScope().$apply(function() {
        var reverse;
        if(!handle && !data) {
          updateValue('y', dy);
          updateValue('x', dx);
          self.update(['y', 'x']);
        } else {
          if(data.connector.indexOf('top') != -1) {
            reverse = (props.y.scale &&
                props.y.scale.range().name == 'height') ? -1 : 1;

            updateValue('y', dy*reverse);
            updateValue('height', dy*-1);
            self.update(['y', 'y2', 'height']);
          }

          if(data.connector.indexOf('bottom') != -1) {
            reverse = (props.y2.scale &&
                props.y2.scale.range().name == 'height') ? -1 : 1;

            updateValue('y2', dy*reverse);
            updateValue('height', dy);
            self.update(['y', 'y2', 'height']);
          }

          if(data.connector.indexOf('left') != -1) {
            updateValue('x', dx);
            updateValue('width', dx*-1);
            self.update(['x', 'x2', 'width']);
          }

          if(data.connector.indexOf('right') != -1) {
            updateValue('x2', dx);
            updateValue('width', dx);
            self.update(['x', 'x2', 'width']);
          }
        }
      });

      dragging.prev = [evt.pageX, evt.pageY];
      vde.iVis.show('selected');
    };

    var mouseup = function() {
      if(self.iVisUpdated)
        vde.iVis.ngScope().$apply(function() {
          vde.iVis.ngTimeline().save();
        });
    };

    return {
      interactors: {handle: this.handles(item)},
      evtHandlers: {mousemove: mousemove, mouseup: mouseup}
    };
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
    }

    vde.iVis.interactor('point', propConnectors)
      .interactor('span', this.spans(item, property))
      .show(['point', 'span']);
  };

  prototype.propertyTargets = function(connector, showGroup) {
    var self  = this,
        item  = this.item(vde.iVis.activeItem),
        props = [],
        spans = [], dropzones = [];

    var connToSpan = {
      'top-left': {props: ['x', 'y'], span: 0},
      'bottom-right': {props: ['x2', 'y2'], span: 1}
    };

    if(connector) props = connToSpan[connector].props;
    if(props.length === 0) props = ['width', 'height'];

    if(showGroup) {
      var groupInteractors = this.group().propertyTargets();
      if(groupInteractors.spans) spans = spans.concat(groupInteractors.spans);
      if(groupInteractors.dropzones) dropzones = dropzones.concat(groupInteractors.dropzones);
    }

    props.forEach(function(prop) {
      var span = self.spans(item, prop);

      if(connector !== null && connector !== undefined && connToSpan[connector])
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

    // Order is important with dropzones to ensure on overlap, the connector dropzones
    // take precendence.
    var connectors = [this.connectors['top-left'].coords(item), this.connectors['bottom-right'].coords(item)];
    dropzones = dropzones.concat(connectors.map(function(c) { return self.dropzones(c); }));

    var mouseover = function(e, item) {
      if(!vde.iVis.dragging || item.mark.def.name != 'dropzone') return;
      if(item.connector)  // For points, switch propertyTargets after a timeout.
        vde.iVis.dropzoneTimeout = window.setTimeout(function() {
          self.propertyTargets((item.connector == connector) ? '' : item.connector, showGroup);
        }, vde.iVis.timeout);
    };

    var clearTimeout = function(e, item) {
      if(!vde.iVis.dragging || item.mark.def.name != 'dropzone') return;
      window.clearTimeout(vde.iVis.dropzoneTimeout);
    };

    vde.iVis.interactor('point', connectors)
      .interactor('span', spans)
      .interactor('dropzone', dropzones)
      .show(['point', 'span', 'dropzone'], {
        mouseover: mouseover,
        mouseout: clearTimeout,
        mouseup: clearTimeout
      });
  };

  prototype.connectionTargets = function() {
    var self  = this,
        item  = this.item(vde.iVis.activeItem);

    var connectors = vg.keys(this.connectors).map(function(c) { return self.connectors[c].coords(item); });
    connectors.sort(function(a) { return a.connector.indexOf('center') ? 1 : -1; });
    var dropzones  = connectors.map(function(c) { return self.dropzones(c); });

    vde.iVis.interactor('connector', connectors)
      .interactor('dropzone', dropzones)
      .show(['connector', 'dropzone']);
  };

  prototype.connect = function(connector, mark) {
    var props = this.properties, mProps = mark.properties,
        ox = mProps.dx.offset, oy = mProps.dy.offset;

    var setProp = function(p1, p2) {
      for(var k in props[p2]) mProps[p1][k] = props[p2][k];
    };

    mark.pipelineName = this.pipelineName;

    // TODO: what if x2/width or y2/height are set instead: -ve mult dx/dys
    setProp('x', 'x');
    setProp('y', 'y');

    if(connector.indexOf('center') != -1) {
      if(props.width.disabled) {
        setProp('dx', 'x2');
        mProps.x.mult = mProps.dx.mult = 0.5;
      } else {
        setProp('dx', 'width');
        mProps.dx.mult = 0.5;
      }
    }

    if(connector.indexOf('right') != -1)
      setProp('dx', props.width.disabled ? 'x2' : 'width');

    if(connector.indexOf('middle') != -1) {
      if(props.height.disabled) {
        setProp('dy', 'y2');
        mProps.y.mult = mProps.dy.mult = 0.5;
      } else {
        setProp('dy', 'height');
        mProps.dy.mult = 0.5;
      }
    }

    if(connector.indexOf('bottom') != -1) {
      if(props.height.disabled) setProp('y', 'y2');
      else setProp('dy', 'height');
    }

    mProps.dx.offset = ox || 0;
    mProps.dy.offset = oy || 0;
  };

  prototype.coordinates = function(connector, item, def) {
    if(!item) item = this.item(vde.iVis.activeItem);
    if(!item) return {x: 0, y: 0};  // If we've filtered everything out.

    var bounds = item.bounds;
    // For groups, we can't use item.bounds because that reflects the max bounds of all enclosed elems
    if(this.type == 'group')
      bounds = new vg.Bounds().set(item.x, item.y, item.x + item.width, item.y + item.height);
    var b = vde.iVis.translatedBounds(item, bounds),
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
    coord.small = b.width() < 20 || b.height() < 20 ? 1 : 0;
    for(var k in def) coord[k] = def[k];

    return coord;
  };

  prototype.handles = function(item) {
    var props = this.properties,
        handles = {};

    for(var c in this.connectors)
      handles[c] = this.connectors[c].coords(item, {disabled: 0});

    delete handles['middle-center'];

    var checkExtents = function(extents, hndls) {
      var count = 0;
      extents.forEach(function(e) { if(props[e].field) count++; });
      if(count > 2) hndls.forEach(function(h) { handles[h].disabled = 1; });
    };

    checkExtents(['y', 'y2', 'height'], ['top-center', 'bottom-center']);
    if(props.y.field) handles['top-center'].disabled = 1;
    if(props.y2.field) handles['bottom-center'].disabled = 1;
    if(props.height.field)
      handles['top-center'].disabled = handles['bottom-center'].disabled = 1;

    checkExtents(['x', 'x2', 'height'], ['middle-left', 'middle-right']);
    if(props.x.field) handles['middle-left'].disabled = 1;
    if(props.x2.field) handles['middle-right'].disabled = 1;
    if(props.width.field)
      handles['middle-left'].disabled = handles['middle-right'].disabled = 1;

    // Now figure out the corners
    ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(function(corner) {
      var h = corner.split('-');
      if(handles[h[0] + '-center'].disabled || handles['middle-' + h[1]].disabled)
        handles[corner].disabled = 1;
    });

    return vg.keys(handles).map(function(h) { return handles[h]; });
  };

  prototype.spans = function(item, property) {
    var props = this.properties,
        b  = vde.iVis.translatedBounds(item, item.bounds),
        gb = vde.iVis.translatedBounds(item.mark.group, item.mark.group.bounds),
        go = 3*geomOffset, io = geomOffset; // offsets

    var facet = vde.Vis.transforms.Facet;

    switch(property) {
      case 'x':
        return [{x: (gb.x1-go), y: (b.y1-io), span: 'x_0'}, {x: b.x1, y: (b.y1-io), span: 'x_0'},
         {x: (gb.x1-go), y: (b.y2+io), span: 'x_1'}, {x: b.x1, y: (b.y2+io), span: 'x_1'}];

      case 'x2':
        return [{x: (gb.x1-go), y: (b.y1-io), span: 'x2_0'}, {x: b.x2, y: (b.y1-io), span: 'x2_0'},
         {x: (gb.x1-go), y: (b.y2+io), span: 'x2_1'}, {x: b.x2, y: (b.y2+io), span: 'x2_1'}];

      case facet.dropzone_horiz: /* falls through */
      case 'width': return [{x: b.x1, y: (b.y1-io), span: property + '_0'}, {x: b.x2, y: (b.y1-io), span: property + '_0'}];

      case 'y':
        return (props.y.scale && props.y.scale.range().name == 'height') ?
          [{x: (b.x1-io), y: (gb.y2+go), span: 'y_0'}, {x: (b.x1-io), y: b.y1, span: 'y_0'},
           {x: (b.x2+io), y: (gb.y2+go), span: 'y_1'}, {x: (b.x2+io), y: b.y1, span: 'y_1'}]
        :
        [{x: (b.x1-io), y: (gb.y1-go), span: 'y_0'}, {x: (b.x1-io), y: b.y1, span: 'y_0'},
         {x: (b.x2+io), y: (gb.y1-go), span: 'y_1'}, {x: (b.x2+io), y: b.y1, span: 'y_1'}];

      case 'y2': 
        return (props.y2.scale && props.y2.scale.range().name == 'height') ?
          [{x: (b.x1-io), y: (gb.y2+go), span: 'y2_0'}, {x: (b.x1-io), y: b.y2, span: 'y2_0'},
           {x: (b.x2+io), y: (gb.y2+go), span: 'y2_1'}, {x: (b.x2+io), y: b.y2, span: 'y2_1'}]
        :
          [{x: (b.x1-io), y: (gb.y1-go), span: 'y2_0'}, {x: (b.x1-io), y: b.y2, span: 'y2_0'},
           {x: (b.x2+io), y: (gb.y1-go), span: 'y2_1'}, {x: (b.x2+io), y: b.y2, span: 'y2_1'}];

      case facet.dropzone_vert: /* falls through */
      case 'height': return [{x: (b.x1-io), y: b.y1, span: property + '_0'}, {x: (b.x1-io), y: b.y2, span: property + '_0'}];
    }
  };

  return rect;
})();
