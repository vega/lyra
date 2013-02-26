vde.primitives.rect = function(panel, name) {
    this.name   = name;
    this.type   = 'rect';
    this.inspector = true;

    this.from   = null;
    this.height = {};
    this.width  = {};
    this.fill   = {'value': 'steelblue'};
    this.stroke = {'value': '#000'};
    this.strokeWidth = {'value': 0};

    this.xOffset = 0;
    this.yOffset = 0;

    return vde.primitive.call(this, panel);
};

vde.primitives.rect.prototype = new vde.primitive();

vde.primitives.rect.prototype.spec = function() {
    return this.panel.spec.mark({'name': this.name, type: 'rect'}, {});
};

vde.primitives.rect.prototype.init = function() { 
    this.panel.marks[this.name] = this;

    return this;
};

vde.primitives.rect.prototype.update = function() {
    this.prop('from', {'data': this.from})
        .prop('properties', {'enter': {
            'x': {'scale': this.width.pill.id, 'field': this.width.pill.domain().field, 'offset': this.xOffset},
            'y': {'scale': this.height.pill.id, 'field': this.height.pill.domain().field, 'offset': this.yOffset},
            'y2': {'scale': this.height.pill.id, 'value': 0, 'offset': this.yOffset},
            'width': {'scale': this.width.pill.id, 'band': true, 'offset': -1},
            'fill': (this.fill.hasOwnProperty('pill') ? {'scale': this.fill.pill.id, 'field': this.fill.pill.domain().field} : {'value': this.fill.value}),
            'stroke': (this.stroke.hasOwnProperty('pill') ? {'scale': this.stroke.pill.id, 'field': this.stroke.pill.domain().field} : {'value': this.stroke.value}),
            'strokeWidth': (this.strokeWidth.hasOwnProperty('pill') ? {'scale': this.strokeWidth.pill.id, 'field': this.strokeWidth.pill.domain().field} : {'value': this.strokeWidth.value})
        }});

    this.panel.compile();

    return this;
}

vde.primitives.rect.prototype.toolbarDrop = function(e) {
    this.init();
    vde.ui.inspector.show(this.panel, this);

    return false;
};

vde.primitives.rect.prototype.getOffset = function() {
    var coords  = d3.mouse(this.panel.el.select('.vis svg').node());
    var xOffset = this.xOffset + (coords[0] - this.panel.mouseDownCoords[0]);
    var yOffset = this.yOffset + (coords[1] - this.panel.mouseDownCoords[1]);

    return [xOffset, yOffset];
};

// vde.primitives.rect.prototype.visMouseMove = function(e) {
//     if(this.panel.visDragging != this)
//         return false;
    
//     var offsets = {
//         'x1': {'offset': this.getOffset()[0]},
//         'y1': {'offset': this.getOffset()[1]},
//         'y2': {'offset': this.getOffset()[1]}
//     };

//     this.prop('enter', offsets).prop('update', offsets);
//     this.panel.resetDuration(true).compile();

//     return false;
// };

// vde.primitives.rect.prototype.visMouseUp = function(e) {
//     if(this.panel.visDragging != this)
//         return false;

//     var coords  = d3.mouse(this.panel.el.select('.vis svg').node());
//     this.xOffset = this.getOffset()[0];
//     this.yOffset = this.getOffset()[1];

//     this.update();

//     return false;
// };