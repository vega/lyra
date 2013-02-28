vde.Primitive = (function() {
    var primitive = function(name) {
        this.spec = {
            name: name
        };

        return this;
    };

    var prototype = primitive.prototype;

    prototype.getSpec = function() { return spec; };

    prototype.initUI = function() { return this; };

    prototype.toolbarDragStart = function(e) { return this; };
    prototype.toolbarDragEnd   = function(e) { return this; };
    prototype.toolbarDrop      = function(e) { return this; };

    return primitive;
})();