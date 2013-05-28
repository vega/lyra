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

        this.dragBounds = {};

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
        this.setAngle()
            .setInnerRadius()
            .setOuterRadius()
            .setFillStroke('fill')
            .setFillStroke('stroke');

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

        return this;
    };

    prototype.setInnerRadius = function() {
        var ir = this.properties.innerRadius;
        if(ir instanceof vde.primitives.Scale)
            ir.spec.range = [0, this.properties.radiiRanges[0]];

        this.enter('innerRadius', (ir instanceof vde.primitives.Scale) ? ir.getDataRef() : {value: this.properties.radiiRanges[0]});

        return this;
    };

    prototype.setOuterRadius = function() {
        var or = this.properties.outerRadius;
        if(or instanceof vde.primitives.Scale)
            or.spec.range = this.properties.radiiRanges;

        this.enter('outerRadius', (or instanceof vde.primitives.Scale) ? or.getDataRef() : {value: this.properties.radiiRanges[1]});

        return this;
    };

    prototype.setFillStroke = function(type) {
        if(this.properties[type] instanceof vde.primitives.Scale) {
            var scale = this.properties[type];
            this.enter(type, scale.getDataRef());
        } else {
            this.enter(type, this.properties[type]);
        }

        return this;
    };

    prototype.onToolbarDrop = function(e) {
        this.init();
        vde.ui.inspector.show(this, [e.pageX, e.pageY]);
    };

    prototype.getDragBounds = function(e, sceneObj) {
        var db = this.dragBounds;
        var coords = vde.ui.mouse(d3.select('#vis').node(), e);

        db.outerDelta = 0.6, db.innerDelta = 0.5;
        db.outerX = (coords[0] - vde.padding.left - this.group.enter('x').value - sceneObj.x) / sceneObj.outerRadius,
        db.outerY = (coords[1] - vde.padding.top - this.group.enter('y').value -  sceneObj.y) / sceneObj.outerRadius,
        db.innerX = (db.outerX*sceneObj.outerRadius)/sceneObj.innerRadius,
        db.innerY = (db.outerY*sceneObj.outerRadius)/sceneObj.innerRadius;

        db.isInner = (Math.abs(db.innerX) > 1+db.innerDelta || Math.abs(db.innerY) > 1+db.innerDelta) ? false : true;
    };

    prototype.onViewMouseDown = function(e, sceneObj) {
        this.getDragBounds(e, sceneObj);
        vde.ui.dragging.isInner = this.dragBounds.isInner;
    };

    prototype.onViewMouseUp = function(e, sceneObj) {
        vde.ui.dragging.isInner = null;
    };

    prototype.onViewMouseMove = function(e, sceneObj) {
        var self = this;
        var coords = vde.ui.mouse(d3.select('#vis').node(), e);
        var cursor = document.body.style.cursor;

        // If we're dragging, first resize the container, and then
        // test for cursor type
        if(vde.ui.dragging && vde.ui.dragging.el == this.spec.name) {
            var old = vde.ui.dragging.old; 

            var update = function(reverse) {
                var diff = Math.floor(Math.sqrt(Math.pow(coords[0] - old[0], 2) + Math.pow(coords[1] - old[1], 2)));
                self.properties.radiiRanges[vde.ui.dragging.isInner ? 0 : 1] += (diff * ((reverse) ? -1 : 1));
                
                vde.ui.inspector.arc.loadValues();

                vde.dirty[self.getName()] = self;
                vde.update();
            };
            
            if(cursor == 'move') {  }
            else if(cursor == 'e-resize') { update(coords[0] < old[0]); }
            else if(cursor == 's-resize') { update(coords[1] < old[1]); }
            else if(cursor == 'n-resize') { update(coords[1] > old[1]); }
            else if(cursor == 'w-resize') { update(coords[0] > old[0]); }
            else if(cursor == 'ne-resize') { update(coords[1] > old[1] || coords[0] < old[0]); }
            else if(cursor == 'se-resize') { update(coords[1] < old[1] || coords[0] < old[0]); }
            else if(cursor == 'nw-resize') { update(coords[1] > old[1] || coords[0] > old[0]); }
            else if(cursor == 'sw-resize') { update(coords[1] < old[1] || coords[0] > old[0]); }

            vde.ui.dragging.old = coords;
        }

        this.getDragBounds(e, sceneObj);
        var db = this.dragBounds;
        var isInner = (vde.ui.dragging) ? vde.ui.dragging.isInner : db.isInner;

        if((!isInner && db.outerX < -db.outerDelta && db.outerY < -db.outerDelta) || (isInner && db.innerX > -(1+db.innerDelta) && db.innerX < 0 && db.innerY > -(1+db.innerDelta) && db.innerY < 0)) {
            cursor = "nw-resize";        
        } else if((!isInner && db.outerX < -db.outerDelta && db.outerY > db.outerDelta) || (isInner && db.innerX > -(1+db.innerDelta) && db.innerX < 0 && db.outerY < (1+db.innerDelta) && db.outerY > 0)) {
            cursor = "sw-resize";
        } else if((!isInner && db.outerX < -db.outerDelta) || (isInner && db.innerX > -(1+db.innerDelta) && db.innerX < 0)) {
            cursor = "w-resize";
        } else if((!isInner && db.outerX > db.outerDelta && db.outerY < -db.outerDelta) || (isInner && db.innerX < (1+db.innerDelta) && db.innerX > 0 && db.innerY > -(1+db.innerDelta) && db.innerY < 0)) {
            cursor = "ne-resize";
        } else if((!isInner && db.outerX > db.outerDelta && db.outerY > db.outerDelta) || (isInner && db.innerX < (1+db.innerDelta) && db.innerX > 0 && db.innerY < (1+db.innerDelta) && db.innerY > 0)) {
            cursor = "se-resize";
        } else if((!isInner && db.outerX > db.outerDelta) || (isInner && db.innerX < (1+db.innerDelta) && db.innerX > 0)) {
            cursor = "e-resize";
        } else if((!isInner && db.outerY < -db.outerDelta) || (isInner && db.innerY > -(1+db.innerDelta) && db.innerY < 0)) {
            cursor = "n-resize";
        } else if((!isInner && db.outerY > db.outerDelta) || (isInner && db.innerY < (1+db.innerDelta) && db.innerY > 0)) {
            cursor = "s-resize";
        } else {
            cursor = "move";
        }

        vde.ui.toolTip(cursor.indexOf('resize') != -1, coords[0]+10, coords[1]+10, ((isInner) ? 'inner' : 'outer') + ' radius');

        document.body.style.cursor = cursor;
    };

    prototype.onViewMouseOut = function() {
        vde.ui.toolTip(false);
        document.body.style.cursor = 'auto';
    };

    prototype.inspectorValues = function() {
        return {
            angle: this.properties.angle,
            innerRadius: this.properties.innerRadius,
            outerRadius: this.properties.outerRadius,
            radiiRanges: this.properties.radiiRanges,
            fill: this.properties.fill,
            stroke: this.properties.stroke,
            strokeWidth: this.properties.strokeWidth
        }
    };

    return arc;
})();