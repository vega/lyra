vde.Vis.marks.Group = (function() {
  var group = function(name, layerName, groupName) {
    vde.Vis.Mark.call(this, name || 'layer_' + vg.keys(vde.Vis.groups).length, layerName, groupName);

    this.displayName = 'Layer ' + vde.Vis.codename(vg.keys(vde.Vis.groups).length);
    this.type   = 'group';
    this.layer  = true;  // A psuedo-group exists in the spec, but not in the VDE UI.
    this.layerName = layerName || this.name;

    this.scales = {};
    this.axes   = {};
    this.marks  = {};
    this.markOrder = [];

    this._spec.scales   = [];
    this._spec.axes   = [];
    this._spec.marks  = [];

    this.fillType = 'color';
    this.properties = {
      x: {value: 0},
      width: {value: vde.Vis.properties.width},
      x2: {value: 0, disabled: true},
      y: {value: 0},
      height: {value: vde.Vis.properties.height},
      y2: {value: 0, disabled: true},
      clip: {value: false},

      fill: {value: '#ffffff'},
      fillOpacity: {value: 0},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0}
    };

    this.connectors = {
      'top-left': {}, 'top-center': {}, 'top-right': {},
      'middle-left' : {}, 'middle-center': {}, 'middle-right': {},
      'bottom-left': {}, 'bottom-center': {}, 'bottom-right': {}
    };

    // Maintain counts at the layer level to properly name marks/axes
    this._markCount = 0;
    this._axisCount = 0;

    return this.init();
  };

  group.prototype = new vde.Vis.Mark();
  var prototype = group.prototype;

  prototype.init = function() {
    if(this.isLayer()) {
      vde.Vis.groups[this.name] = this;
      vde.Vis.groupOrder.push(this.name);
    }

    return vde.Vis.Mark.prototype.init.call(this);
  };

  prototype.update = function(props) {
    vde.Vis.Mark.prototype.update.call(this, props);

    var layout = props.indexOf('layout') != -1;
    if(layout) this.doLayout(this.layout);

    // Because a group could affect sub-marks, re-parse the submarks
    for(var m in this.marks)
      this.marks[m].update(['x', 'x2', 'width', 'y', 'y2', 'height']);

    if(layout) vde.Vis.parse();

    return this;
  };

  prototype.spec = function() {
    var self = this;
    var spec = vg.duplicate(vde.Vis.Mark.prototype.spec.call(this));

    // We should be smarter than this.
    vg.keys(spec.properties.enter).forEach(function(k) {
      var p = spec.properties.enter[k];
      if(p.field) p.field = p.field.replace('stats.', '');
    });

    vde.Vis.callback.run('group.pre_spec', this, {spec: spec});

    ['scales', 'axes'].forEach(function(t) {
      vg.keys(self[t]).forEach(function(k) {
        var s = self[t][k].spec();
        if(!s) return;
        if(s.inheritFromGroup && !self.isLayer()) delete s.domain.data;
        spec[t].push(s);
      });
    });

    // Reverse order of marks: earlier in markOrder => closer to front
    this.markOrder.forEach(function(m) {
      var s = self.marks[m].spec();
      if(!s) return;
      spec.marks.unshift(s);
    });

    vde.Vis.callback.run('group.post_spec', this, {spec: spec});

    return spec;
  };

  prototype.bookkeep = function() {
    for(var s in this.scales)
      if(!this.scales[s].used && !this.scales[s].manual) delete this.scales[s];
  };

  prototype.scale = function(mark, searchDef, defaultDef, displayName) {
    var scale = mark.pipeline().scale(searchDef, defaultDef, displayName);
    if(!this.isLayer()) this.group().scales[scale.name] = scale;
    this.scales[scale.name] = scale;

    return scale;
  };

  prototype.annotate = function() {
    this._def = null;
    this._items = [];
    this.def();

    for(var m in this.marks) {
      this.marks[m]._def = null;
      this.marks[m]._items = [];
      this.marks[m].def();
      if(this.marks[m].type == 'group') this.marks[m].annotate();
    }
  };

  prototype.export = function() {
    // Export w/o circular structure in marks
    if(!this._def && this._items.length === 0) return vg.duplicate(this);
    var marks = this.marks, def = this.def(), items = this.items();

    // We save it to _marks in case of nested groups, which need to stick
    // around in this.marks
    this._marks = {};
    for(var m in marks) {
      var ex = marks[m].export();
      this._marks[ex.name] = ex;
    }
    this._def = null;
    this._items = [];
    this.marks = this._marks;
    delete this._marks;

    var exported = vg.duplicate(this);
    this.marks = marks;
    this._def = def;
    this._items = items;

    return exported;
  };

  prototype.isLayer = function() {
    return this.layerName == this.name;
  };

  prototype.bindProperty = function(prop, opts) {
    if(!opts.pipelineName || !opts.field) return;

    var pipeline = vde.Vis.pipelines[opts.pipelineName], facet = vde.Vis.transforms.Facet;
    var transform = new facet();
    transform.bindProperty('keys', opts);
    transform.properties.layout =
        vde.Vis.transforms.Facet[(prop == facet.dropzone_horiz) ? 'layout_horiz' : 'layout_vert'];

    pipeline.addTransform(transform);
  };

  prototype.doLayout = function(layout) {
    var facet = vde.Vis.transforms.Facet, self = this;

    var copyFromLayer = function(props) {
      props.forEach(function(prop) {
        self.properties[prop] = {};
        var fromProp = self.group().properties[prop];
        if(fromProp.scale) self.properties[prop].scale = fromProp.scale;
        if(fromProp.field)
          self.properties[prop].field = new vde.Vis.Field(fromProp.field.name,
              fromProp.field.accessor, fromProp.field.type, fromProp.field.pipelineName,
              fromProp.field.stat);
        if(fromProp.hasOwnProperty('value')) self.properties[prop].value = fromProp.value;
        if(fromProp.disabled) self.properties[prop].disabled = fromProp.disabled;
      });
    };

    if(layout == facet.layout_overlap) {
      copyFromLayer(['x', 'width', 'x2', 'y', 'height', 'y2']);
    } else {
      var isHoriz = layout == facet.layout_horiz;
      var scale = this.group().scale(this, {
        domainTypes: {from: 'field'},
        domainField: new vde.Vis.Field('key', '', 'ordinal', this.pipeline().forkName),
        rangeTypes: {type: 'spatial', from: 'preset'},
        rangeField: new vde.Vis.Field(isHoriz ? 'width' : 'height')
      }, {
        properties: {type: 'ordinal', padding: 0.2}
      }, 'Groups');
      scale.properties.points = false;

      var keyField = {
        scale: scale,
        field: new vde.Vis.Field('key', '', 'ordinal', this.pipeline().forkName)
      };

      var bandField = { scale: scale, value: 'auto' };

      if(isHoriz) {
        this.properties.x = keyField;
        this.properties.width = bandField;
        this.properties.x2.disabled = true;
        copyFromLayer(['y', 'height', 'y2']);
      } else {
        this.properties.y = keyField;
        this.properties.height = bandField;
        this.properties.y2.disabled = true;
        copyFromLayer(['x', 'width', 'x2']);
      }
    }

    this.layout = layout;
  };

  prototype.selected = function() {
    // Since groups are fancy rects
    var self = this, selected = vde.Vis.marks.Rect.prototype.selected.call(this);

    // But we want to reparse the spec on mouseup (i.e. interactive resize)
    // to get the axes to do the right thing.
    selected.evtHandlers.mouseup = function() {
      if(self.iVisUpdated) {
        vde.Vis.parse();

        vde.iVis.ngScope().$apply(function() {
          vde.iVis.ngTimeline().save();
        });
      }
    };

    return selected;
  };

  // A group should only have propertyTargets, if it's a layer so that we can
  // use it to do grouping+layout.
  prototype.propertyTargets = function() {
    var self = this, item = this.item(vde.iVis.activeItem || 0),
        dropzones = [], spans = [];

    if(!self.isLayer()) return {};

    // We want the width/height spans of a rect mark, and then when binding,
    // we'll interpret them as horizontal/vertical group by layout.
    var facet = vde.Vis.transforms.Facet;
    [facet.dropzone_horiz, facet.dropzone_vert].forEach(function(prop) {
      var span = self.spans(item, prop);
      var zone = self.dropzones(span);
      if(prop == facet.dropzone_horiz) {
        zone.hint = facet.hint_horiz;
//        zone.y += 15; zone.y2 += 15;
      } else {
        zone.hint = facet.hint_vert;
//        zone.x += 15; zone.x2 += 15;
      }
      dropzones = dropzones.concat(zone);
      spans     = spans.concat(span);
    });

    return {spans: [], dropzones: dropzones};
  };

  prototype.coordinates = function(connector, item, def) {
    return vde.Vis.marks.Rect.prototype.coordinates.call(this, connector, item, def);
  };

  prototype.handles = function(item) {
    return vde.Vis.marks.Rect.prototype.handles.call(this, item);
  };

  prototype.spans = function(item, property) {
    return vde.Vis.marks.Rect.prototype.spans.call(this, item, property);
  };

  return group;
})();
