vde.primitives.rect = function(panel, name) {
    this.name   = name;
    this.type   = 'rect';
    this.inspector = true;
    this.field  = null;

    this.fill   = '#4682b4';
    this.stroke = '#000';
    this.strokeWidth = 0;

    this.xScale = new vde.primitives.scale(panel, this.name + '_x');
    this.yScale = new vde.primitives.scale(panel, this.name + '_y');

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
    this.scale('x', {'data': 'table', 'field': 'a'})
        .scale('y', {'data': 'table', 'field': this.field})
        .prop('from', 'table')
        .prop('enter', {
            'x1': {'scale': this.xScale.name, 'field': 'a'},
            'y1': {'scale': this.yScale.name, 'value': 0},
            'y2': {'scale': this.yScale.name, 'value': 0},
            'width': {'scale': this.xScale.name, 'band': true, 'offset': -1},
            'fill': {'value': this.fill},
            'stroke': {'value': this.stroke},
            'strokeWidth': {'value': this.strokeWidth}
        })
        .prop('update', {
            'x1': {'scale': this.xScale.name, 'field': 'a'},
            'width': {'scale': this.xScale.name, 'band': true, 'offset': -1},
            'y1': {'scale': this.yScale.name, 'field': this.field},
            'y2': {'scale': this.yScale.name, 'value': 0},
            'fill': {'value': this.fill},
            'stroke': {'value': this.stroke},
            'strokeWidth': {'value': this.strokeWidth}
        });

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

vde.primitives.rect.prototype.onDrop = function(e) {
    this.init()
    this.field = 'b';
    this.update();

    return false;
}