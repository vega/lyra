vde.primitives.marks.Rect = (function() {
    var rect = function(name, group) {
        vde.primitives.Mark.call(this, name);

        this.spec.type = 'rect';
        this.group = group;

        this.fullClass = 'vde.primitives.marks.Rect';

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
    };

    prototype.initUI = function() {
        vde.ui.addPrimitiveToolbar(this);
        vde.ui.inspector.load(this);
        return this;
    };

    prototype.onToolbarDrop = function(e) {
        this.init();
        vde.ui.inspector.show(this, [e.pageX, e.pageY]);
    };

    prototype.inspectorValues = function() {
        return {
            enter_x:  this.enter('x'),
            enter_x2: this.enter('x2'),
            enter_y:  this.enter('y'),
            enter_y2: this.enter('y2'),
            enter_width: this.enter('width'),
            enter_height: this.enter('height'),
            enter_fill: this.enter('fill'),
            enter_stroke: this.enter('stroke'),
            enter_strokeWidth: this.enter('strokeWidth')
        };
    };

    return rect;
})();