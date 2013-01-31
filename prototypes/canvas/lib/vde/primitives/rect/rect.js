vde.primitives.rect = function(name, panel) {
    this.name   = name;

    this.xScale = new vde.primitives.scale(this.name + '_x');
    this.yScale = new vde.primitives.scale(this.name + '_y');

    return vde.primitive.call(this, panel);
};

vde.primitives.rect.prototype = new vde.primitive();

vde.primitives.rect.prototype.spec = function() {
    return this.panel.spec.mark({'name': this.name}, {});
};

vde.primitives.rect.prototype.init = function() {
    this.panel.scales[this.name + '_x'] = this.xScale;
    this.panel.scales[this.name + '_y'] = this.yScale;   
    this.panel.marks[this.name] = this;

    return this;
};

vde.primitives.rect.prototype.update = function(field) {
    this.scale('x', {'data': 'table', 'field': 'i'})
        .scale('y', {'data': 'table', 'field': field})
        .enter({
            'x1': {'scale': this.xScale.name, 'field': 'i'},
            'y1': {'scale': this.yScale.name, 'value': 0},
            'y2': {'scale': this.yScale.name, 'value': 0},
            'width': {'scale': this.xScale.name, 'band': true, 'offset': -1},
            'fill': {'value': 'steelblue'}
        })
        .update({
            'y1': {'scale': this.yScale.name, 'field': field},
            'y2': {'scale': this.yScale.name, 'value': 0}
        });

    this.panel.compile();

    return this;
}

vde.primitives.rect.prototype.scale = function(type, domain) {      
    if(type == 'x') {
        this.xScale
            .prop('type', 'ordinal')
            .prop('domain', domain)
            .prop('range', 'width');
    } else if(type == 'y') {
        this.yScale
            .prop('type', 'linear')
            .prop('domain', domain)
            .prop('range', 'height');
    }

    return this;
};