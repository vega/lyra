vde.primitives.rect = function(panel, name) {
    this.name   = name;
    this.type   = 'rect';
    this.inspector = true;

    this.fill   = '#4682b4';
    this.stroke = '#000';
    this.strokeWidth = 0;

    this.xScale = new vde.primitives.scale(panel, this.name + '_x');
    this.yScale = new vde.primitives.scale(panel, this.name + '_y');
    this.xDomain = {'data': 'dummy', 'field': ['data', 'a']};
    this.yDomain = {'data': 'dummy', 'field': ['data', 'b']};

    this.xOffset = 0;
    this.yOffset = 0;

    return vde.primitive.call(this, panel);
};

vde.primitives.rect.prototype = new vde.primitive();

vde.primitives.rect.prototype.spec = function() {
    return this.panel.spec.mark({'name': this.name, type: 'rect'}, {});
};

vde.primitives.rect.prototype.init = function() {
    this.panel.scales[this.name + '_x'] = this.xScale;
    this.panel.scales[this.name + '_y'] = this.yScale;   
    this.panel.marks[this.name] = this;

    return this;
};

vde.primitives.rect.prototype.update = function() {
    this.scale('x', this.xDomain)
        .scale('y', this.yDomain)
        .prop('from', {'data': 'dummy'})
        .prop('properties', {'enter': {
            'x': {'scale': this.xScale.name, 'field': this.xDomain.field, 'offset': this.xOffset},
            'y': {'scale': this.yScale.name, 'value': 0, 'offset': this.yOffset},
            'y2': {'scale': this.yScale.name, 'value': 0, 'offset': this.yOffset},
            'width': {'scale': this.xScale.name, 'band': true, 'offset': -1},
            'fill': {'value': this.fill},
            'stroke': {'value': this.stroke},
            'strokeWidth': {'value': this.strokeWidth}
        }})
        .prop('properties', {'update': {
            'x': {'scale': this.xScale.name, 'field': this.xDomain.field, 'offset': this.xOffset},
            'width': {'scale': this.xScale.name, 'band': true, 'offset': -1},
            'y': {'scale': this.yScale.name, 'field': this.yDomain.field, 'offset': this.yOffset},
            'y2': {'scale': this.yScale.name, 'value': 0, 'offset': this.yOffset},
            'fill': {'value': this.fill},
            'stroke': {'value': this.stroke},
            'strokeWidth': {'value': this.strokeWidth}
        }});

    this.panel.compile();

    return this;
}

vde.primitives.rect.prototype.scale = function(type, domain) {      
    if(type == 'x') {
        this.xScale
            .prop('type', 'ordinal')
            .prop('domain', domain)
            .prop('range', 'width')
            .prop('round', true)
            .prop('padding', '0');
    } else if(type == 'y') {
        this.yScale
            .prop('type', 'linear')
            .prop('domain', domain)
            .prop('range', 'height');
    }

    return this;
};

vde.primitives.rect.prototype.toolbarDrop = function(e) {
    this.init().update();
    return false;
};

vde.primitives.rect.prototype.getOffset = function() {
    var coords  = d3.mouse(this.panel.el.select('.vis svg').node());
    var xOffset = this.xOffset + (coords[0] - this.panel.mouseDownCoords[0]);
    var yOffset = this.yOffset + (coords[1] - this.panel.mouseDownCoords[1]);

    return [xOffset, yOffset];
};

vde.primitives.rect.prototype.visMouseMove = function(e) {
    if(this.panel.visDragging != this)
        return false;
    
    var offsets = {
        'x1': {'offset': this.getOffset()[0]},
        'y1': {'offset': this.getOffset()[1]},
        'y2': {'offset': this.getOffset()[1]}
    };

    this.prop('enter', offsets).prop('update', offsets);
    this.panel.resetDuration(true).compile();

    return false;
};

vde.primitives.rect.prototype.visMouseUp = function(e) {
    if(this.panel.visDragging != this)
        return false;

    var coords  = d3.mouse(this.panel.el.select('.vis svg').node());
    this.xOffset = this.getOffset()[0];
    this.yOffset = this.getOffset()[1];

    this.update();

    return false;
};