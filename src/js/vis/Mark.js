vde.Vis.Mark = (function() {
  var mark = function(name) {
    this.name = name;
    this.displayName = name;

    this.group    = null;
    this.pipeline = null;

    this._spec = {
      properties: {
        enter:  {},
        update: {},
        hover:  {}
      }
    };

    this.extents = {};

    return this;
  };

  var prototype = mark.prototype;

  prototype.init = function() {
    if(!this.group)
      this.group = new vde.Vis.marks.Group();

    if(!this.name)
      this.name = this.type + '_' + (vg.keys(this.group.marks).length+1);

    if(!this.displayName) 
      this.displayName = this.name;

    this.group.marks[this.name] = this;

    return this;
  };

  prototype.spec = function() {
    var spec = vg.duplicate(this._spec);

    vde.Vis.Callback.run('mark.pre_spec', this, {spec: spec});

    spec.name = this.name;
    spec.type = this.type;
    spec.from = {};

    if(this.pipeline) spec.from.data = this.pipeline.name;

    var props = {};

    for(var prop in this.properties) {
      var p = this.properties[prop];
      if(p.disabled) continue;

      props[prop] = {};
      for(var k in p) {
        if(p[k] == undefined) continue;

        if(k == 'scale') props[prop][k] = p[k].name;
        else if(k == 'field') props[prop][k] = p[k].spec();
        else props[prop][k] = p[k];
      };
    }

    spec.properties.enter  = props;
    // spec.properties.update = props;

    vde.Vis.Callback.run('mark.post_spec', this, {spec: spec});

    return spec;
  };

  prototype.enter = function(k, v) {
    return this.prop('enter', k, v);
  };

  prototype.update = function(k, v) {
    if(!k && !v) return this.updateProps();

    return this.prop('update', k, v);
  };

  prototype.hover = function(k, v) {
    return this.prop('hover', k, v);
  };

  prototype.prop = function(type, k, v) {
    if(!v) return this._spec.properties[type][k];

    this._spec.properties[type][k] = v;
    return this;
  };

  prototype.bindProperty = function(prop, opts) {
    this.properties[prop] || (this.properties[prop] = {});

    if(opts.scaleName)
      this.properties[prop].scale = this.pipeline.scales[opts.scaleName];

    if(opts.field) {
      var scale, field = opts.field;
      if(!(field instanceof vde.Vis.Field)) field = new vde.Vis.Field(field);

      switch(prop) {
        case 'fill':
        case 'stroke':
          scale = this.pipeline.scale({
            type: field.type || 'ordinal',
            field: field,
            range: new vde.Vis.Field('category20')
          });          
        break;

        default:
          var prules = this.productionRules(prop, opts.scale, field);
          scale = prules[0];
          field = prules[1];
        break;
      }

      this.properties[prop].scale = scale;
      this.properties[prop].field = field;
    }

    this.checkExtents(prop);
    delete this.properties[prop].value;
  };

  prototype.productionRules = function(prop, scale, field) {
    return [scale, field];
  };

  prototype.checkExtents = function(prop) {
    var self = this;
    for(var ext in this.extents) {
      var e = this.extents[ext];
      if(e.fields.indexOf(prop) == -1) continue;

      var check = e.fields.reduce(function(c, f) { return (self.properties[f] || {}).scale ? c : c.concat([f]) }, []);

      // If we've hit the limit based on scales, then disable the rest of the fields
      if(e.fields.length - check.length == e.limit)
        check.forEach(function(f) { self.properties[f].disabled = true; });
      else {  // Otherwise, check the history
        var limit = e.limit - (e.fields.length - check.length);
        e.history || (e.history = []);

        if(e.history[e.history.length-1] != prop) e.history.push(prop);
        delete this.properties[prop].disabled; 

        if(e.history.length > limit) {
          var p = e.history.shift();
          if(p != prop && check.indexOf(p) != -1) this.properties[p].disabled = true;
        }
      }
    }
  };

  prototype.unbindProperty = function(prop) {
    this.properties[prop] = {value: 0};
  };

  prototype.def = function() {
    var path = [], p = this,
    defs = vde.Vis.view.model().defs(),
    d = defs.marks;

    while(p) {
      path.push(p.name);
      p = p.group;
    }

    var findMarkDef = function(def, name) {
      if(def.name == name)
        return def;

      for(var i = 0; i < def.marks.length; i++) {
        if(def.marks[i].name == name)
          return def.marks[i];
      }

      return null;
    } 

    while(p = path.pop()) {
      if(d.name == p)
        continue;

      d = findMarkDef(d, p);
      if(!d)
        return null;
    }

    return d;
  };

  prototype.updateProps = function() {
    var def  = this.def(),
        spec = this.spec();

    def.properties.enter  = vg.parse.properties(spec.properties.enter);
    def.properties.update = vg.parse.properties(spec.properties.update);
  };

  return mark;
})();

vde.Vis.marks = {};