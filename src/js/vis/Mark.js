vde.Vis.Mark = (function() {
  var mark = function(name, groupName) {
    this.name = name;
    this.displayName = name;

    this.groupName    = groupName;
    this.pipelineName = null;
    this.oncePerFork = false;

    this._spec = {
      properties: {
        enter:  {}
        // update: {},
        // hover:  {}
      }
    };

    this.extents = {};

    this._def   = null;
    this._items = [];

    return this;
  };

  var prototype = mark.prototype;
  var geomOffset = 7;

  prototype.init = function() {
    var self = this;
    if(!this.groupName) {
      var g = new vde.Vis.marks.Group();
      this.groupName = g.name;
    }

    if(!this.name)
      this.name = this.type + '_' + (vg.keys(this.group().marks).length+1);

    if(!this.displayName)
      this.displayName = this.name;

    if(this.group() != this)
      this.group().marks[this.name] = this;

    vg.keys(this.connectors).forEach(function(c) {
      self.connectors[c] = {
        connections: [],
        coords: function(item, def) { return self.coordinates(c, item, def); }
      };
    });

    vde.Vis.addEventListener('click', function(e, item) {
      if(item.mark.def != self.def()) return;
      if(item.items && self.type != 'group') return;

      vde.iVis.ngScope().toggleVisual(self, item.vdeKey || item.key || 0);
    });

    // Highlight/unhighlight group
    vde.Vis.addEventListener('mouseover', function(e, item) {
      if(!item.mark.def.vdeMdl) return;
      var m = item.mark.def.vdeMdl;
      if(!m.group()) return;

      m.group().items().map(function(i) {
        if(i.strokeWidth != 0) return;
        i.strokeWidth = 1;
        i.strokeDash = [1.5, 3];
        i.vdeStroked = true;
        vde.Vis.view.render();
      });
    });

    vde.Vis.addEventListener('mouseout', function(e, item) {
      if(!item.mark.def.vdeMdl) return;
      var m = item.mark.def.vdeMdl;
      if(!m.group()) return;

      m.group().items().map(function(i) {
        if(!i.vdeStroked) return;
        i.strokeWidth = 0;
        delete i.strokeDash;
        delete i.vdeStroked;
        vde.Vis.view.render();
      });
    })

    return this;
  };

  prototype.pipeline = function() {
    return vde.Vis.pipelines[this.pipelineName];
  };

  prototype.group = function() {
    return vde.Vis.groups[this.groupName];
  };

  prototype.property = function(prop) {
    var p = this.properties[prop], parsed = {};
    if(!vg.isObject(p)) return;
    if(p.disabled) return;

    for(var k in p) {
      if(p[k] == undefined) return;

      if(k == 'scale') parsed[k] = p[k].name;
      else if(k == 'field') parsed[k] = p[k].spec();
      else {
        var value = (!isNaN(+p[k])) ? +p[k] : p[k];
        if(value == 'auto') {   // If the value is auto, rangeband
          if(p.scale.type() == 'ordinal') {
            parsed.band = true;
            parsed.offset = -1;
          } else parsed[k] = 0; // If we don't have an ordinal scale, just set value:0
        } else {
          parsed[k] = value;
        }
      }
    };

    return parsed;
  };

  prototype.update = function(props) {
    var self = this, def  = this.def();
    if(!vg.isArray(props)) props = [props];

    var update = props.reduce(function(up, prop) {
      var p = self.property(prop);
      if(p) up[prop] = p;
      return up;
    }, {});

    // if(update[prop].scale) vde.Vis.parse();
    // else {
      def.properties.update = vg.parse.properties(this.type, update);
      vde.Vis.view.update();
    // }

    return this;
  };

  prototype.spec = function() {
    var spec = vg.duplicate(this._spec);

    vde.Vis.callback.run('mark.pre_spec', this, {spec: spec});

    spec.name = this.name;
    spec.type = this.type;
    spec.from || (spec.from = {});

    if(this.pipeline()) spec.from.data || (spec.from.data = this.pipeline().name);

    var props = {}, enter = spec.properties.enter;
    for(var prop in this.properties)
      props[prop] = enter[prop] ? enter[prop] : this.property(prop);
    spec.properties.enter = props;

    vde.Vis.callback.run('mark.post_spec', this, {spec: spec});

    this._def = null;

    return spec.properties ? spec : null;
  };

  prototype.bindProperty = function(prop, opts, defaults) {
    this.properties[prop] || (this.properties[prop] = {});
    var scale, field;

    if(opts.scaleName) {
      scale = this.pipeline().scales[opts.scaleName];
      this.group().scales[opts.scaleName] = scale;
      this.properties[prop].scale = scale;
    } else {
      scale = this.properties[prop].scale;
    }

    if(opts.field) {
      field = opts.field;
      if(!(field instanceof vde.Vis.Field)) field = new vde.Vis.Field(field);
      if(!scale) {
        switch(prop) {
          case 'x':
            scale = this.group().scale(this, {
              field: field
            }, {
              type: field.type || 'ordinal',
              range: new vde.Vis.Field('width')
            }, 'x');
          break;

          case 'y':
            scale = this.group().scale(this, {
              field: field,
            }, {
              type: field.type || 'linear',
              range: new vde.Vis.Field('height')
            }, 'y');
          break;

          case 'fill':
          case 'stroke':
            scale = this.group().scale(this, {
              type: 'ordinal',
              field: field,
              range: new vde.Vis.Field('category20')
            }, {}, prop + '_color');
          break;

          case 'fillOpacity':
          case 'strokeWidth':
            scale = this.group().scale(this, {
              field: field,
              range: (prop == 'fillOpacity') ? [0, 1] : [0, 10]
            }, {
              type: field.type || 'linear'
            }, prop);
          break;
        }
      }

      var prules = this.productionRules(prop, scale, field);
          scale = prules[0];
          field = prules[1];

      if(scale) this.properties[prop].scale = scale;
      if(field) this.properties[prop].field = field;
      delete this.properties[prop].value;
    }

    if(defaults) {
      this.defaults(prop);

      // Add axes by defaults
      var aOpts = {pipelineName: (scale || field || this).pipelineName};
      if(scale) aOpts.scaleName = scale.name;
      switch(prop) {
        case 'x':
        case 'x2':
        case 'width':
          var xAxis = new vde.Vis.Axis('x_axis', this.groupName);
          var ap = xAxis.properties;
          ap.type = 'x'; ap.orient = 'bottom';
          xAxis.bindProperty('scale', aOpts);
        break;

        case 'y':
        case 'y2':
        case 'height':
          var yAxis = new vde.Vis.Axis('y_axis', this.groupName);
          var ap = yAxis.properties;
          ap.type = 'y'; ap.orient = 'left';
          yAxis.bindProperty('scale', aOpts);
        break;
      }
    } else {
      this.checkExtents(prop);
    }
  };

  prototype.productionRules = function(prop, scale, field) {
    return [scale, field];
  };

  prototype.checkExtents = function(prop) {
    var self = this;

    for(var ext in this.extents) {
      var e = this.extents[ext], p = this.properties[prop];
      if(e.fields.indexOf(prop) == -1) continue;

      var check = e.fields.reduce(function(c, f) { return (self.properties[f] || {}).scale ? c : c.concat([f]) }, []);
      var hist  = e.history || (e.history = []);
      if(hist.indexOf(prop) != -1) hist.splice(hist.indexOf(prop), 1);
      delete p.disabled;

      // If we've hit the limit based on scales, then disable the rest of the fields
      if(e.fields.length - check.length == e.limit)
        check.forEach(function(f) { self.properties[f].disabled = true; });
      else {  // Otherwise, check the history
        var remaining = e.limit - (e.fields.length - check.length);
        if(!p.scale) hist.push(prop);

        if(hist.length > remaining) {
          var pOld = hist.shift();
          if(pOld != prop && check.indexOf(pOld) != -1) this.properties[pOld].disabled = true;
          this.update(pOld);
        }
      }
    }
  };

  prototype.unbindProperty = function(prop) {
    this.properties[prop] = {value: 0};
  };

  prototype.def = function() {
    var self  = this,
        start = this.type == 'group' ? vde.Vis.view.model().defs().marks : this.group().def();

    if(this._def) return this._def;

    var visit = function(node, name) {
      if(!name) name = self.name;
      for(var i = 0; i < node.marks.length; i++)
        if(node.marks[i].name == name) return node.marks[i];

      return null;
    };

    var def = visit(start);
    if(!def && this.groupName && this.group() != this) {
      // If we haven't found the def in the group, there must be
      // some group injection going on. This means that the last
      // mark in the group def should be another group def.
      var marks = this.group().def().marks;
      start = marks[marks.length-1];
      if(start.type == 'group' && start.name.indexOf(this.groupName) != -1)
        def = visit(start);
    }

    def.vdeMdl = this;
    this._def = def;

    return this._def;
  };

  prototype.items = function() {
    var self = this,
        parents = this.type == 'group' ? [vde.Vis.view.model().scene().items[0]] : this.group().items(),
        def = this.def();

    if(this._items.length > 0) return this._items;

    var visit = function(parent, group) {
      var items = [];
      parent.items.forEach(function(i) {
        if(i.def && (i.def == def || (group && i.marktype == 'group')))
          items = items.concat(i.items);
      });
      return items;
    };

    for(var p = 0; p < parents.length; p++)
      this._items = this._items.concat(visit(parents[p]));

    if(this._items.length == 0) {
      // If we've found no items in the group, there must be
      // group injection going on. So first find those groups
      // and use them as parents
      var groups = [];
      for(var p = 0; p < parents.length; p++)
        groups = groups.concat(visit(parents[p], true));

      for(var g = 0; g < groups.length; g++)
        this._items = this._items.concat(visit(groups[g]));
    }

    for(var i = 0; i < this._items.length; i++) this._items[i].vdeKey = i;

    // this._items = this._items.sort(function(a, b) { return a.key - b.key; });
    return this._items;
  };

  prototype.item = function(i) {
    if(i.key) return i;

    var items = this.items();
    if(i > items.length) i = 0;

    return items[i];
  };

  prototype.export = function() {
    // Export w/o the circular structure
    if(!this._def && this._items.length == 0) return vg.duplicate(this);
    var def = this.def(), items = this.items();

    this._def = null;
    this._items = [];
    var ex = vg.duplicate(this);
    this._def = def;
    this._items = items;

    return ex;
  };

  prototype.defaults = function(prop) { return null; }

  prototype.selected = function() { return null; }
  prototype.helper = function(property) { return null; }
  prototype.target = function(connector) { return null; }

  prototype.coordinates = function(connector, item, def) { return null; }
  prototype.handles = function(item) { return null; }
  prototype.spans = function(item, property) { return null; }

  prototype.dropzones = function(area) {
    if(area.connector) {
      return {
        x: area.x-geomOffset, x2: area.x+geomOffset,
        y: area.y-geomOffset, y2: area.y+geomOffset,
        connector: area.connector,
        property: area.property
      }
    } else {
      if(area[0].x == area[1].x)
        return {
          x: area[0].x-2*geomOffset, x2: area[0].x+2*geomOffset,
          y: area[0].y, y2: area[1].y,
          property: area[0].span.split('_')[0]
        }
      else if(area[0].y == area[1].y)
        return {
          x: area[0].x, x2: area[1].x,
          y: area[0].y-2*geomOffset, y2: area[0].y+2*geomOffset,
          property: area[0].span.split('_')[0]
        }
    }
  };

  return mark;
})();

vde.Vis.marks = {};
