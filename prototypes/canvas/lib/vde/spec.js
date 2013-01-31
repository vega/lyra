vde.spec = function() {
    // Vega spec
    this.spec = {
        data:   [],
        scales: [],
        axes:   [],
        marks:  []
    };

    // Compiled visualization
    this.vis = {};

    return this;
};

vde.spec.prototype.set = function(key, value) {
    this.spec[key] = value;
    return this;
};

vde.spec.prototype.get = function(property, criteria) {
    var property = this.spec[property];

    if(criteria && property instanceof Array) {
        var _return = false;
        property.forEach(function(p) {
            for(var key in criteria)
                _return = (p[key] == criteria[key]) ? true : false;
            
            if(_return) p;
        });
        return null;
    }

    return property;
};

vde.spec.prototype.scale = function(criteria, defaultValue) {
    var scale = this.get('scales', criteria);
    if(!scale) {
        for(key in criteria) defaultValue[key] = criteria[key];
        defaultValue['type'] || (defaultValue['type'] = 'linear');
        var idx = this.spec.scales.push(defaultValue);
        scale = this.spec.scales[idx];
    }

    return scale;
};

vde.spec.prototype.axis = function(criteria, defaultValue) {
    var axis = this.get('axes', criteria);
    if(!axis) {
        for(key in criteria) defaultValue[key] = criteria[key];
        var idx = this.spec.axes.push(defaultValue);
        axis = this.spec.axes[idx];
    }

    return axis;
};

vde.spec.prototype.mark = function(criter, defaultValue) {
    var mark = this.get('marks', criteria);
    if(!mark) {
        for(key in criteria) defaultValue[key] = criteria[key];
        var idx = this.spec.marks.push(defaultValue);
        mark = this.spec.marks[idx];
    }

    return mark;       
};

vde.spec.compile = function() {
  var source = vg.compile(spec, vde.template);
  eval("source = "+source+";");
  this.vis = source();

  return this;
};