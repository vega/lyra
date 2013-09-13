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

    this.connectors = {};
    this.connectedTo = {};

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

    if(this.group() != this) {
      this.group().marks[this.name] = this;
      this.group().markOrder.unshift(this.name);
    }

    vg.keys(this.connectors).forEach(function(c) {
      self.connectors[c] = {
        coords:  function(item, def) { return self.coordinates(c, item, def); },
        connect: function(mark) { return self.connect(c, mark); }
      };
    });

    vde.Vis.addEventListener('click', this, function(e, item) {
      if(item.mark.def != self.def()) return;
      if(item.items && self.type != 'group') return;

      vde.iVis.ngScope().toggleVisual(self, item.vdeKey || item.key || 0);
    });

    // Highlight/unhighlight group
    vde.Vis.addEventListener('mouseover', this, function(e, item) {
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

    vde.Vis.addEventListener('mouseout', this, function(e, item) {
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

  prototype.destroy = function() {
    vde.Vis.removeEventListener('click', this);
    vde.Vis.removeEventListener('mouseover', this);
    vde.Vis.removeEventListener('mouseout', this);
  };

  prototype.pipeline = function() {
    return vde.Vis.pipelines[this.pipelineName];
  };

  prototype.group = function() {
    return vde.Vis.groups[this.groupName];
  };

  prototype.property = function(prop) {
    return vde.Vis.parseProperty(this.properties, prop);
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

    var conn = this.connectedTo;
    if(conn.host) conn.host.connectors[conn.connector].connect(this);

    vde.Vis.callback.run('mark.pre_spec', this, {spec: spec});

    spec.name = this.name;
    spec.type || (spec.type = this.type);
    spec.from || (spec.from = {});

    if(this.pipeline()) spec.from.data || (spec.from.data = this.pipeline().name);

    var enter = spec.properties.enter;
    for(var prop in this.properties)
      enter[prop] = enter[prop] ? enter[prop] : this.property(prop);

    vde.Vis.callback.run('mark.post_spec', this, {spec: spec});

    this._def = null;

    return spec.properties ? spec : null;
  };

  prototype.bindProperty = function(prop, opts, defaults) {
    var p = this.properties[prop] || (this.properties[prop] = {});
    var scale, field;

    if(opts.scaleName) {
      scale = this.pipeline().scales[opts.scaleName];
      this.group().scales[opts.scaleName] = scale;
      p.scale = scale;
    } else {
      scale = p.scale;
    }

    if(opts.field) {
      field = opts.field;
      if(!(field instanceof vde.Vis.Field)) field = new vde.Vis.Field(field);

      // Run mark specific production rules first so that they get first dibs
      var prules = this.productionRules(prop, scale, field);
          scale = prules[0];
          field = prules[1];

      if((!scale || p.default) && (field && field.type != 'encoded')) {
        var defaultDef = {}, displayName = null,
            searchDef = {
              domainTypes: {from: 'field'},
              domainField: field,
              rangeTypes: {}
            };

        switch(prop) {
          case 'x':
          case 'x2':
          case 'width':
            searchDef.rangeTypes.type = 'spatial';
            defaultDef = {
              properties: { type: field.type || 'ordinal'},
              rangeTypes: {type: 'spatial', from: 'field'},
              rangeField: new vde.Vis.Field('width'),
              axisType: 'x'
            };
            displayName = 'x';
          break;

          case 'y':
          case 'y2':
          case 'height':
            searchDef.rangeTypes.type = 'spatial';
            defaultDef = {
              properties: { type: field.type || 'linear'},
              rangeTypes: {type: 'spatial', from: 'field'},
              rangeField: new vde.Vis.Field('height'),
              axisType: 'y'
            };
            displayName = 'y';
          break;

          case 'fill':
          case 'stroke':
            searchDef.rangeTypes.type = 'colors';
            defaultDef = {
              properties: { type: 'ordinal'},
              rangeTypes: {type: 'colors', from: 'field'},
              rangeField: new vde.Vis.Field('category20')
            };
            displayName = prop + '_color';
          break;

          case 'fillOpacity':
          case 'strokeWidth':
            searchDef.rangeTypes = {type: 'other', property: prop};
            defaultDef = {
              properties: { type: field.type || 'linear'},
              rangeTypes: {type: 'other', from: 'values', property: prop},
              rangeValues: (prop == 'fillOpacity') ? [0, 1] : [0, 10]
            };
            displayName = prop;
          break;
        }

        if(this.type == 'rect' && defaultDef.properties.type == 'ordinal')
          defaultDef.properties.points = false;

        scale = this.group().scale(this, searchDef, defaultDef, displayName);
      }

      if(scale) p.scale = scale;
      if(field) p.field = field;
      delete p.value;
      delete p.default;
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
    }

    this.checkExtents(prop);
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

  prototype.disconnect = function() {
    var conn = this.connectedTo;
    if(conn.host) conn.host.connectors[conn.connector].connect(this);

    this.connectedTo = {};
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
      var marks = this.group().def().marks, start = [];
      for(var i = 0; i < marks.length; i++)
        if(marks[i].type == 'group' && marks[i].name.indexOf(this.groupName) != -1)
          start.push(marks[i]);

      start.some(function(s) { if(def = visit(s)) return true; });
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
    if(!this._def && this._items.length == 0 && !this.connectedTo.host)
        return vg.duplicate(this);

    var def = this.def(), items = this.items(), connectedTo = this.connectedTo.host;

    this._def = null;
    this._items = [];
    delete this.connectedTo.host;
    var ex = vg.duplicate(this);
    this._def = def;
    this._items = items;
    this.connectedTo.host = connectedTo;

    return ex;
  };

  prototype.defaults = function(prop) { return null; }

  prototype.selected = function() { return {}; }
  prototype.helper   = function(property) { return null; }

  prototype.propertyTargets   = function() { return null; }
  prototype.connectionTargets = function() { return null; }

  prototype.connect = function(connector, mark) { return null; }

  prototype.coordinates = function(connector, item, def) { return null; }
  prototype.handles = function(item) { return null; }
  prototype.spans = function(item, property) { return null; }

  prototype.dropzones = function(area) {
    if(area.connector) {
      return {
        x: area.x-1.5*geomOffset, x2: area.x+1.5*geomOffset,
        y: area.y-1.5*geomOffset, y2: area.y+1.5*geomOffset,
        connector: area.connector,
        property: area.property,
        layout: 'point'
      }
    } else {
      if(area[0].x == area[1].x)
        return {
          x: area[0].x-2*geomOffset, x2: area[0].x+2*geomOffset,
          y: area[0].y, y2: area[1].y,
          property: area[0].span.split('_')[0],
          layout: 'vertical'
        }
      else if(area[0].y == area[1].y)
        return {
          x: area[0].x, x2: area[1].x,
          y: area[0].y-2*geomOffset, y2: area[0].y+2*geomOffset,
          property: area[0].span.split('_')[0],
          layout: 'horizontal'
        }
    }
  };

  return mark;
})();

vde.Vis.marks = {};
