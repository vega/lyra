vde.Primitive = (function() {
    var primitive = function(name) {
        this.spec = {
            name: name
        };

        this.class = 'vde.Primitive';

        return this;
    };

    var prototype = primitive.prototype;

    prototype.getName = function() { return this.spec.name; }
    prototype.getType = function() { return this.spec.type; }
    prototype.getSpec = function() { return this.spec; };

    prototype.initUI = function() { return this; };

    prototype.toolbarDragStart = function(e) { return this; };
    prototype.toolbarDragEnd   = function(e) { return this; };
    prototype.toolbarDrop      = function(e) { return this; };

    return primitive;
})();