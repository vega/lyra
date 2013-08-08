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

    this._def = null;

    return this;
  };

  var prototype = mark.prototype;

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

    this.group().marks[this.name] = this;

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
    if(p.disabled) return;

    for(var k in p) {
      if(p[k] == undefined) return;

      if(k == 'scale') parsed[k] = p[k].name;
      else if(k == 'field') parsed[k] = p[k].spec();
      else parsed[k] = p[k];
    };

    return parsed;
  };

  prototype.update = function(prop) {
    var def  = this.def(), update = {};
    update[prop] = this.property(prop);

    def.properties.update = vg.parse.properties(this.type, update);
    vde.Vis.view.update();

    return this;
  };

  prototype.spec = function() {
    var spec = vg.duplicate(this._spec);

    vde.Vis.Callback.run('mark.pre_spec', this, {spec: spec});

    spec.name = this.name;
    spec.type = this.type;
    spec.from = {};

    if(this.pipeline()) spec.from.data = this.pipeline().name;

    var props = {};

    for(var prop in this.properties) props[prop] = this.property(prop);

    spec.properties.enter = props;

    vde.Vis.Callback.run('mark.post_spec', this, {spec: spec});

    this._def = null;

    return spec;
  };

  prototype.bindProperty = function(prop, opts) {
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
        }        
      }

      var prules = this.productionRules(prop, scale, field);
          scale = prules[0];
          field = prules[1];

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
        }
      }
    }
  };

  prototype.unbindProperty = function(prop) {
    this.properties[prop] = {value: 0};
  };

  prototype.def = function() {
    var self  = this,
        start = this.groupName ? this.group().def() : vde.Vis.view.model().defs().marks; 

    var visit = function(node, name) {
      if(!name) name = self.name;
      for(var i = 0; i < node.marks.length; i++)
        if(node.marks[i].name == name) return node.marks[i];

      return null;
    };

    if(this._def) return this._def;

    var def = visit(start);
    if(!def && this.groupName) {
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

  prototype.ngScope = function() {
    return angular.element($('body')).scope();
  };

  return mark;
})();

vde.Vis.marks = {};