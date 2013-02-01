vde.ui.inspector.rect = {
    primitive: null,
    el: null,
    type: 'rect'
};

vde.ui.inspector.rect.init = function(rect) {
    var self = this;
    this.primitive = rect;
    this.el = d3.select('#inspector_rect');

    this.el.select('.fill input')
        .property('value', this.primitive.fill)
        .on('change', function() {
            vde.ui.inspector.updateProperty.call(self, 'fill');
            self.updateDelegate('fill');
        });

    this.el.select('.stroke input')
        .property('value', this.primitive.stroke)
        .on('change', function() {
            vde.ui.inspector.updateProperty.call(self, 'stroke');
            self.updateDelegate('stroke');
        });

    this.el.select('.strokeWidth input')
        .property('value', this.primitive.strokeWidth)
        .on('change', function() {
            vde.ui.inspector.updateProperty.call(self, 'strokeWidth');
            self.updateDelegate('strokeWidth', 'stroke-width');
        });

    vde.ui.inspector.populateFields.call(this, 'height', true, false);
    vde.ui.inspector.populateFields.call(this, 'false', true, true);
};

vde.ui.inspector.rect.updateDelegate = function(property, style) {
    style || (style = property);
    this.el.select('rect').style(style, vde.ui.inspector.getProperty.call(this, property));
};

vde.ui.inspector.rect.close = function() {
    return vde.ui.inspector.close.call(this);
};