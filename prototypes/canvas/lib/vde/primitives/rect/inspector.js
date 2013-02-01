vde.ui.inspector.rect = {
    primitive: null,
    el: null,
    type: 'rect'
};

vde.ui.inspector.rect.init = function(rect) {
    var self = this;
    this.primitive = rect;
    this.el = d3.select('#inspector_rect');

    vde.ui.inspector.init.call(this);

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

    vde.ui.inspector.populateFields.call(this, 'width', true, true);
    vde.ui.inspector.populateFields.call(this, 'height', true, false);

    this.el.select('.width select')
        .property('value', vde.ui.inspector.getScaleDomain.call(this, 'xDomain'))
        .on('change', function() {
            vde.ui.inspector.updateScaleDomain.call(self, 'xDomain', 'width');
    });    

    this.el.select('.height select')
        .property('value', vde.ui.inspector.getScaleDomain.call(this, 'yDomain'))
        .on('change', function() {
            vde.ui.inspector.updateScaleDomain.call(self, 'yDomain', 'height');
        }); 
};

vde.ui.inspector.rect.updateDelegate = function(property, style) {
    style || (style = property);
    this.el.select('rect').style(style, vde.ui.inspector.getProperty.call(this, property));
};

