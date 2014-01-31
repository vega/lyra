vde.Vis.marks.Group = (function() {
  var group = function(name) {
    vde.Vis.Mark.call(this, name || 'layer_' + vg.keys(vde.Vis.groups).length);

    this.displayName = 'Layer ' + vde.Vis.codename(vg.keys(vde.Vis.groups).length);
    this.type   = 'group';
    this.layer  = true;  // A psuedo-group exists in the spec, but not in the VDE UI.
    this.groupName = this.name;

    this.scales = {};
    this.axes   = {};
    this.marks  = {};
    this.markOrder = [];

    this._spec.scales   = [];
    this._spec.axes   = [];
    this._spec.marks  = [];

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

    return this.init();
  };

  group.prototype = new vde.Vis.Mark();
  var prototype = group.prototype;

  prototype.init = function() {
    var self = this;
    vde.Vis.groups[this.name] = this;
    vde.Vis.groupOrder.unshift(this.name);

    //////
    // This is too difficult to get correct w/multiple overlapping
    // groups. So just follow the photoshop model where things get
    // added to the current layer.
    //////
    // vde.Vis.addEventListener('mouseup', function(e, item) {
    //   if(item.mark.def != self.def()) return;
    //   if(!vde.iVis.dragging || !vde.iVis.newMark) return;

    //   vde.iVis.addMark(self);
    // });

    return vde.Vis.Mark.prototype.init.call(this);
  };

  prototype.update = function(props) {
    vde.Vis.Mark.prototype.update.call(this, props);

    // Because a group could affect sub-marks, re-parse the submarks
    for(var m in this.marks)
      this.marks[m].update(['x', 'x2', 'width', 'y', 'y2', 'height']);

    return this;
  }

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
      if(!this.scales[s].used) delete this.scales[s];
  };

  prototype.scale = function(mark, searchDef, defaultDef, displayName) {
    var scale = mark.pipeline().scale(searchDef, defaultDef, displayName);
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
    }
  };

  prototype.export = function() {
    // Export w/o circular structure in marks
    if(!this._def && this._items.length == 0) return vg.duplicate(this);
    var marks = this.marks, def = this.def(), items = this.items();

    this.marks = {};
    for(var m in marks) {
      var ex = marks[m].export();
      this.marks[ex.name] = ex;
    }
    this._def = null;
    this._items = [];

    var ex = vg.duplicate(this);
    this.marks = marks;
    this._def = def;
    this._items = items;

    return ex;
  };

  prototype.selected = function() {
    // Since groups are fancy rects
    var selected = vde.Vis.marks.Rect.prototype.selected.call(this);

    // But we want to reparse the spec on mouseup (i.e. interactive resize)
    // to get the axes to do the right thing.
    selected.evtHandlers.mouseup = function() {
      vde.Vis.parse();

      vde.iVis.ngScope().$apply(function() {
        vde.iVis.ngTimeline().save();
      })
    };

    return selected;
  };

  prototype.coordinates = function(connector, item, def) {
    return vde.Vis.marks.Rect.prototype.coordinates.call(this, connector, item, def);
  };

  prototype.handles = function(item) {
    return vde.Vis.marks.Rect.prototype.handles.call(this, item);
  };

  prototype.spans = function(item, property) {
    return vde.Vis.marks.Rect.prototype.spans.call(this, item, property);
  }

  return group;
})();
