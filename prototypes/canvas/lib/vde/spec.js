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
};

vde.spec.prototype.getProperty = function(property, criteria) {
    var property = this.spec[property];

    if(criteria && property instanceof Array) {
        var _return = false;
        property.forEach(function(p) {
            for(var key in criteria)
                _return = (p[key] == criteria[key]) ? true : false;
            
            if(_return) break;
        });
        if(!_return) return undefined;
    }

    return property;
};

vde.spec.prototype.scale = function(criteria, defaultValue) {
    var scale = this.getProperty('scales', criteria);
    if(!scale) {
        for(key in criteria) defaultValue[key] = criteria[key];
        defaultValue['type'] || (defaultValue['type'] = 'linear');
        var idx = this.spec.scales.push(defaultValue);
        scale = this.spec.scales[idx];
    }

    return scale;
};

vde.spec.prototype.axis = function(criteria, defaultValue) {
    var axis = this.getProperty('axes', criteria);
    if(!axis) {
        for(key in criteria) defaultValue[key] = criteria[key];
        var idx = this.spec.axes.push(defaultValue);
        axis = this.spec.axes[idx];
    }

    return axis;
};

vde.spec.prototype.mark = function(criter, defaultValue) {
    var mark = this.getProperty('marks', criteria);
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
};