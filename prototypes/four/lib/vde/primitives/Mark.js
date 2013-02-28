vde.primitives.Mark = (function() {
    var mark = function(name) {
        vde.Primitive.call(this, name);

        this.spec.from = null;

        this.spec.properties = {
            enter:  {},
            update: {},
            hover:  {}
        };

        this.class = 'vde.primitives.Mark';

        return this;
    };

    mark.prototype = new vde.Primitive();
    var prototype = mark.prototype;

    prototype.enter = function(k, v) {
        this.spec.properties.enter[k] = v;
        return this;
    };

    prototype.update = function(k, v) {
        this.spec.properties.update[k] = v;
        return this;
    };

    prototype.hover = function(k, v) {
        this.spec.properties.hover[k] = v;
        return this;
    }

    return mark;
})();