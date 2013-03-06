vde.primitives.Scale = (function() {
    var scale = function(name, group) {
        vde.Primitive.call(this, name);

        this.group = group;

        this.type = 'scale';
        this.fullClass = 'vde.primitives.Scale';

        return this;
    };

    scale.prototype = new vde.Primitive();
    var prototype = scale.prototype;

    scale.nameFromSpec = function(spec) {
        var name = spec.type || 'linear';

        if(spec.domain)
            name += '_' + spec.domain.data + '_' + spec.domain.field;

        if(spec.range)
            name += '_' + spec.range
        // TODO:Data Transforms
        return name;
    };

    prototype.init = function(group, spec) {
        var self = this;

        this.group = group;
        this.group.scales[this.getName()] = this;
        vg.keys(spec).forEach(function(s) { self.spec[s] = spec[s]; });

        return this;
    };

    prototype.getDataRef = function() {
        return {
            scale: this.spec.name,
            field: this.spec.domain.field
        };
    }

    prototype.domain = function(def) {
        if(!def) return this.spec.domain;

        this.spec.domain = def;
        return this;
    };

    return scale;
})();