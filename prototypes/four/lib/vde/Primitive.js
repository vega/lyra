vde.Primitive = (function() {
    var primitive = function(name) {
        this.spec = {
            name: name
        };

        this.fullClass = 'vde.Primitive';

        return this;
    };

    var prototype = primitive.prototype;

    prototype.getName = function() { return this.spec.name; }
    prototype.getType = function() { return this.spec.type; }
    prototype.getClass = function(full) { return full ? this.fullClass : this.type.charAt(0).toUpperCase() + this.type.slice(1);} 
    prototype.getSpec = function() { return this.spec; };

    prototype.initUI = function() { return this; };

    prototype.onToolbarDragStart = function(e) { return this; };
    prototype.onToolbarDragEnd   = function(e) { return this; };
    prototype.onToolbarDrop      = function(e) { return this; };

    return primitive;
})();