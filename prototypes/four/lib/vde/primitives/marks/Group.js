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

        this.class = 'vde.primitives.marks.Group';

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

        this.enter('x', {'value': (mouse ? mouse[0] : 0)})
            .enter('width', {'value': this.default.width})
            .enter('y', {'value': (mouse ? mouse[1] : 0)})
            .enter('height', {'value': this.default.height});

        vde.groups[this.getName()] = this;

        return this;
    };

  return group;
})();