vde.primitives.Mark = (function() {
    var mark = function(name) {
        vde.Primitive.call(this, name);

        this.spec.from = null;

        this.spec.properties = {
            enter:  {},
            update: {},
            hover:  {}
        };

        this.fullClass = 'vde.primitives.Mark';

        return this;
    };

    mark.prototype = new vde.Primitive();
    var prototype = mark.prototype;

    prototype.getClass = function(full) { return full ? this.fullClass : this.spec.type.charAt(0).toUpperCase() + this.spec.type.slice(1);} 

    prototype.init = function() {
        if(!this.group) {
            this.group = new vde.primitives.marks.Group("group_" + Date.now());
            this.group.init();
        }

        this.group.marks[this.getName()] = this;

        return this;
    };

    prototype.enter = function(k, v) {
        return this.prop('enter', k, v);
    };

    prototype.update = function(k, v) {
        return this.prop('update', k, v);
    };

    prototype.hover = function(k, v) {
        return this.prop('hover', k, v);
    };

    prototype.prop = function(type, k, v) {
        if(!v) return this.spec.properties[type][k];

        this.spec.properties[type][k] = v;
        return this;
    };

    return mark;
})();