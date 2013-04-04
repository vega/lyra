vde.primitives.marks.Group = (function() {
    var group = function(name) {
        vde.primitives.Mark.call(this, name);

        this.spec.type = 'group';
        this.spec.scales = [];
        this.spec.axes   = [];
        this.spec.marks  = [];

        this.scales = {};
        this.axes   = {};
        this.marks  = {};

        this.default = {
            width:  450,
            height: 300
        };

        this.fullClass = 'vde.primitives.marks.Group';

        return this;
    };

    group.prototype = new vde.primitives.Mark();
    var prototype = group.prototype;

    prototype.getSpec = function() {
        var self = this;
        var spec = vg.duplicate(this.spec);

        vg.keys(this.scales).forEach(function(k) { spec.scales.push(self.scales[k].getSpec()); });
        vg.keys(this.axes).forEach(function(k) { spec.axes.push(self.axes[k].getSpec()); });
        vg.keys(this.marks).forEach(function(k) { spec.marks.push(self.marks[k].getSpec()); });

        return spec;
    };

    prototype.init = function() {
        // Only define a "from" for a group when we do small multiples
        // this.spec.from = null;  

        var mouse = d3.mouse(d3.select('#vis').node());

        this.enter('x', {'value': (mouse ? mouse[0] : 0) - vde.padding.left})
            .enter('width', {'value': this.default.width})
            .enter('y', {'value': (mouse ? mouse[1] : 0) - vde.padding.top})
            .enter('height', {'value': this.default.height});

        vde.groups[this.getName()] = this;

        return this;
    };

    prototype.scale = function(spec) {
        var scaleName = vde.primitives.Scale.nameFromSpec(spec);
        var scale = this.scales[scaleName];

        if(!scale)
            scale = new vde.primitives.Scale(scaleName)
                .init(this, spec);

        return scale;
    };

    prototype.onViewMouseMove = function(e, obj) {
        var self = this;
        var coords = vde.ui.mouse(d3.select('#vis').node(), e);
        var cursor = document.body.style.cursor;

        // If we're dragging, first resize the container, and then
        // test for cursor type
        if(vde.ui.dragging && vde.ui.dragging.el == this.spec.name) {
            var update = function(prop, reverse) {
                var c = (prop == 'x' || prop == 'width') ? 0 : 1;
                var newVal = self.enter(prop).value;
                newVal += (reverse ? -1 : 1) * (coords[c] - vde.ui.dragging.old[c]);

                self.enter(prop, {value: newVal});
                obj[prop] = newVal;

                vde.view._build = false;
                vde.view.update();
            };
            
            if(cursor == 'move') { update('x'); update('y'); }
            else if(cursor == 'e-resize') { update('width'); }
            else if(cursor == 's-resize') { update('height'); }
            else if(cursor == 'n-resize') { update('y'); update('height', true); }
            else if(cursor == 'w-resize') { update('x'); update('width', true); }
            else if(cursor == 'ne-resize') { update('y'); update('height', true); update('width'); }
            else if(cursor == 'se-resize') { update('height'); update('width'); }
            else if(cursor == 'nw-resize') { update('y'); update('height', true); update('x'); update('width', true); }
            else if(cursor == 'sw-resize') { update('height'); update('x'); update('width', true); }

            vde.ui.dragging.old = coords;
        }

        // After any resizing/moving, set the cursor
        var delta = 0.1;
        var dx = (coords[0] - vde.padding.left - this.enter('x').value) / this.enter('width').value;
        var dy = (coords[1] - vde.padding.top -  this.enter('y').value) / this.enter('height').value;
        
        if(dx < delta && dy < delta) {
            cursor = "nw-resize";        
        } else if(dx < delta && dy>(1 - delta)) {
            cursor = "sw-resize";
        } else if(dx < delta) {
            cursor = "w-resize";
        } else if(dx > (1 - delta) && dy < delta) {
            cursor = "ne-resize";
        } else if(dx > (1 - delta) && dy > (1 - delta)) {
            cursor = "se-resize";
        } else if(dx > (1 - delta)) {
            cursor = "e-resize";
        } else if(dy < delta) {
            cursor = "n-resize";
        } else if(dy > (1 - delta)) {
            cursor = "s-resize";
        } else {
            cursor = "move";
        }

        document.body.style.cursor = cursor;
    };

    prototype.onViewMouseOut = function(e) {
        document.body.style.cursor = 'auto';
    };

    prototype.onViewMouseUp = function(e, i) {
        // if(vde.ui.dragging && vde.ui.dragging.el == this.spec.name)
            // vde.parse();
    }

    return group;
})();