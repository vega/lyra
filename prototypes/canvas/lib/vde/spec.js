vde.spec = function() {
    // Vega spec
    this.spec = {
        data:   [],
        scales: [],
        axes:   [],
        marks:  []
    };

    return this;
};

vde.spec.prototype.set = function(key, value) {
    this.spec[key] = value;
    return this;
};

vde.spec.prototype.get = function(property, criteria) {
    var prop = this.spec[property];
    if(criteria && prop instanceof Array) {
        var _return = null;
        prop.some(function(p) {
            for(var key in criteria)
                _return = (p[key] == criteria[key]) ? p : null;

            if(_return) return true;
        });
        return _return;
    }

    return prop;
};

vde.spec.prototype.scale = function(criteria, defaultValue) {
    var scale = this.get('scales', criteria);
    if(!scale) {
        for(key in criteria) defaultValue[key] = criteria[key];
        defaultValue['type'] || (defaultValue['type'] = 'linear');
        var len = this.spec.scales.push(defaultValue);
        scale = this.spec.scales[--len];
    }

    return scale;
};

vde.spec.prototype.axis = function(criteria, defaultValue) {
    var axis = this.get('axes', criteria);
    if(!axis) {
        for(key in criteria) defaultValue[key] = criteria[key];
        var len = this.spec.axes.push(defaultValue);
        axis = this.spec.axes[--len];
    }

    return axis;
};

vde.spec.prototype.mark = function(criteria, defaultValue) {
    var mark = this.get('marks', criteria);
    if(!mark) {
        for(key in criteria) defaultValue[key] = criteria[key];
        var len = this.spec.marks.push(defaultValue);
        mark = this.spec.marks[--len];
    }

    return mark;       
};

vde.spec.prototype.parse = function(callback) {
    vg.parse.spec(this.spec, callback);
};