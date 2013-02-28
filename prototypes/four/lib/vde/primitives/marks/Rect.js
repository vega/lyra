vde.primitives.marks.Rect = (function() {
    var rect = function(name, group) {
        vde.primitives.Mark.call(this, name);

        this.spec.type = 'rect';
        this.group = group;

        this.class = 'vde.primitives.marks.Rect';

        this.default = {
            width:  50,
            height: 150,
            fill: 'steelblue',
            stroke: 'black',
            strokeWidth: 0
        };

        return this;
    };

    rect.prototype = new vde.primitives.Mark();
    var prototype  = rect.prototype;

    prototype.initUI = function() {
        vde.ui.addPrimitiveToolbar(this);
        return this;
    };

    prototype.init = function() {
        if(!this.group) {
            this.group = new vde.primitives.marks.Group("group_" + Date.now());
            this.group.init();
        }

        this.group.marks[this.getName()] = this;

        this.enter('x', {'value': 0})
            .enter('width', {'value': this.default.width})
            .enter('y', {'value': 0})
            .enter('height', {'value': this.default.height})
            .enter('fill', {'value': this.default.fill});

        return this;
    }

    prototype.toolbarDrop = function(e) {
        this.init();
    };

    return rect;
})();