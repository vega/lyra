vde.primitives.marks.Rect = (function() {
    var rect = function(name, group) {
        vde.primitives.Mark.call(this, name);

        this.spec.type = 'rect';
        this.group = group;

        this.fullClass = 'vde.primitives.marks.Rect';

        this.properties = {
            width: {value: 50},
            height: {value: 150},
            fill: {value: '#4682b4'},
            stroke: {value: '#000000'},
            strokeWidth: {value: 0}
        };

        return this;
    };

    rect.prototype = new vde.primitives.Mark();
    var prototype  = rect.prototype;

    prototype.initUI = function() {
        vde.ui.addPrimitiveToolbar(this);
        vde.ui.inspector.load(this);
        return this;
    };

    prototype.getSpec = function() {
        this.setWidth();
        this.setHeight();
        this.setFillStroke('fill');
        this.setFillStroke('stroke');

        this.enter('strokeWidth', this.properties.strokeWidth);
        // TODO: update shouldn't be the same as enter. 
        this.spec.properties.update = this.spec.properties.enter;

        return this.spec;
    }

    prototype.setWidth = function() {
        if(this.properties.width instanceof vde.primitives.Scale) {
            var scale = this.properties.width;
            this.enter('x', scale.getDataRef())
                .enter('width', {
                    scale: scale.spec.name,
                    band: true,
                    offset: -1
                });
        } else {
            if(this.spec.from) {
                var scale = this.group.scale({
                    type: 'ordinal',
                    range: 'width',
                    domain: {data: this.spec.from.data, field: ['index']}
                });
                this.enter('x', scale.getDataRef())
            } else {
                this.enter('x', {value: 0});
            }

            this.enter('width', this.properties.width);            
        }
    };

    prototype.setHeight = function() {
        if(this.properties.height instanceof vde.primitives.Scale) {
            var scale = this.properties.height;
            this.enter('y', scale.getDataRef()).enter('y2', {
                scale: scale.spec.name,
                value: 0
            });
        } else {
            this.enter('y', this.properties.height)
                .enter('y2', {value: 0});
        }
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
            // x1:  this.enter('x'),
            // x2: this.enter('x2'),
            // y1:  this.enter('y'),
            // y2: this.enter('y2'),
            width: this.properties.width,
            height: this.properties.height,
            fill: this.properties.fill,
            stroke: this.properties.stroke,
            strokeWidth: this.properties.strokeWidth
        };
    };

    return rect;
})();