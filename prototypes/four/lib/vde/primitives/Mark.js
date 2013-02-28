vde.primitives.Mark = (function() {
    var mark = function(name) {
        vde.Primitive.call(this, name);

        this.spec.from = null;

        this.spec.properties = {
            enter:  {},
            update: {},
            hover:  {}
        };

        return this;
    };

    mark.prototype = new vde.Primitive();
    var prototype = mark.prototype;

    return mark;
})();