vde.primitives.marks.Rect = (function() {
    var rect = function(name, group) {
        vde.primitives.Mark.call(this, name);

        this.spec.type = 'rect';
        this.group = group;

        return this;
    };

    rect.prototype = new vde.primitives.Mark();
    var prototype  = rect.prototype;

    prototype.initUI = function() {
        vde.ui.addPrimitiveToolbar(this);
        return this;
    };

    return rect;
})();