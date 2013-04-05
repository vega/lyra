vde.primitives.marks.Arc = (function() {
    var arc = function(name, group) {
        vde.primitives.Mark.call(this, name);

        this.spec.type = 'arc';
        this.group = group;

        this.fullClass = 'vde.primitives.marks.Arc';

        this.properties = {
            x: {value: 150},
            y: {value: 150},
            startAngle: {value: 0},
            endAngle: {value: 360},
            innerRadius: {value: 0},
            outerRadius: {value: 100},
            radiiRanges: [0, 100],    // [innerRadiusRange, outerRadiusRange]
            fill: {value: '#4682b4'},
            stroke: {value: '#000000'},
            strokeWidth: {value: 1}
        };

        return this;
    };

    arc.prototype = new vde.primitives.Mark;
    var prototype  = arc.prototype;

    prototype.initUI = function() {
        vde.ui.addPrimitiveToolbar(this);
        vde.ui.inspector.load(this);
        return this;
    };

    prototype.getSpec = function() {
        this.setAngle();
        this.setInnerRadius();
        this.setOuterRadius();

        this.setFillStroke('fill');
        this.setFillStroke('stroke');

        this.enter('x', this.properties.x)
            .enter('y', this.properties.y)
            .enter('strokeWidth', this.properties.strokeWidth);
        // TODO: update shouldn't be the same as enter. 
        this.spec.properties.update = this.spec.properties.enter;

        return this.spec;
    }

    prototype.setAngle = function() {
        var a = (this.properties.angle || {});
        if(a.hasOwnProperty('field')) {
            this.spec.from.transform = [{'type': 'pie', 'value': 'data.' + this.properties.angle.field}];
            this.enter('startAngle', {'field': 'startAngle'})
                .enter('endAngle', {'field': 'endAngle'});
        } else {
            var deg2rad = function(p) { return {value: p.value/180*Math.PI}; }

            if(this.spec.from) {
                this.spec.from.transform = [{'type': 'pie'}];
                this.enter('startAngle', {'field': 'startAngle'})
                    .enter('endAngle', {'field': 'endAngle'});
            } else {
                this.enter('startAngle', deg2rad(this.properties.startAngle))
                    .enter('endAngle', deg2rad(this.properties.endAngle));
            }      
        }
    };

    prototype.setInnerRadius = function() {
        var ir = this.properties.innerRadius;
        if(ir instanceof vde.primitives.Scale)
            ir.spec.range = [0, this.properties.radiiRanges[0]];

        this.enter('innerRadius', (ir instanceof vde.primitives.Scale) ? ir.getDataRef() : ir);
    };

    prototype.setOuterRadius = function() {
        var or = this.properties.outerRadius;
        if(or instanceof vde.primitives.Scale)
            or.spec.range = this.properties.radiiRanges;

        this.enter('outerRadius', (or instanceof vde.primitives.Scale) ? or.getDataRef() : or);
    };

    prototype.setFillStroke = function(type) {
        if(this.properties[type] instanceof vde.primitives.Scale) {
            var scale = this.properties[type];
            this.enter(type, scale.getDataRef());
        } else {
            this.enter(type, this.properties[type]);
        }
    };

    prototype.onToolbarDrop = function(e) {
        this.init();
        vde.ui.inspector.show(this, [e.pageX, e.pageY]);
    };

    prototype.inspectorValues = function() {
        return {
            angle: this.properties.angle,
            innerRadius: this.properties.innerRadius,
            outerRadius: this.properties.outerRadius,
            fill: this.properties.fill,
            stroke: this.properties.stroke,
            strokeWidth: this.properties.strokeWidth
        }
    };

    return arc;
})();