vde.Vis.Mark = (function() {
  var mark = function(name) {
    this.name = name;

    this._spec = {
      from: null,
      properties: {
        enter:  {},
        update: {},
        hover:  {}
      }
    };

    return this;
  };

  var prototype = mark.prototype;

  prototype.init = function() {
    if(!this.group) {
      this.group = new vde.Vis.marks.Group();
      this.group.init();
    }

    if(!this.name)
      this.name = this.type + '_' + vg.keys(this.group.marks).length;

    this.group.marks[this.name] = this;

    return this;
  };

  prototype.spec = function() {
    this._spec.name = this.name;
    this._spec.type = this.type;

    return this._spec;
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

  prototype.def = function() {
    var path = [], p = this,
    defs = vde.Vis._view.model().defs(),
    d = defs.marks;

    while(p) {
      path.push(p.getName());
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