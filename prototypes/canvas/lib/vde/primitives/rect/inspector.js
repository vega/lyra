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

    var drop = function(property) {
        var opts = JSON.parse(d3.event.dataTransfer.getData('vde.capsule'));
        var field = d3.select(this);
        field.select('.default').style('display', 'none');
        field.selectAll('.capsule').remove();
        field.classed('bound', true);

        var p = new vde.ui.capsule(opts.src, opts.field, true).build(field);
        p.el.select('.delete').on('click', function() {
            field.select('.capsule').remove();
            field.select('.default').style('display', 'block');
            field.classed('bound', false);
            self.primitive.update();
        });
        p.init(self.primitive.panel);
        self.primitive[property] = {'capsule': p};
        self.primitive.from = opts.src;
        if(property == 'height') {
            p.scale.prop('type', 'linear')
                .prop('range', 'height')
        } else if(property == 'width') {
            p.scale.prop('type', 'ordinal')
                .prop('range', 'width')
                .prop('nice', true);
        }

        self.primitive.update();
    }

    this.el.select('.height')
        .on('dragenter', vde.ui.inspector.onDragEnter)
        .on('dragleave', vde.ui.inspector.onDragLeave)
        .on('dragover', vde.ui.cancelDrag)
        .on('drop', function() { drop.call(this, 'height'); });

    this.el.select('.width')
        .on('dragenter', vde.ui.inspector.onDragEnter)
        .on('dragleave', vde.ui.inspector.onDragLeave)
        .on('dragover', vde.ui.cancelDrag)
        .on('drop', function() { drop.call(this, 'width'); });

    this.el.select('.fill')
        .on('dragenter', vde.ui.inspector.onDragEnter)
        .on('dragleave', vde.ui.inspector.onDragLeave)
        .on('dragover', vde.ui.cancelDrag)
        .on('drop', function() { drop.call(this, 'fill'); });

    this.el.select('.stroke')
        .on('dragenter', vde.ui.inspector.onDragEnter)
        .on('dragleave', vde.ui.inspector.onDragLeave)
        .on('dragover', vde.ui.cancelDrag)
        .on('drop', function() { drop.call(this, 'stroke'); });

    this.el.select('.strokeWidth')
        .on('dragenter', vde.ui.inspector.onDragEnter)
        .on('dragleave', vde.ui.inspector.onDragLeave)
        .on('dragover', vde.ui.cancelDrag)
        .on('drop', function() { drop.call(this, 'strokeWidth'); });

    this.el.select('.fill input')
        .property('value', this.primitive.fill.value)
        .on('change', function() {
            vde.ui.inspector.updateProperty.call(self, 'fill');
            self.updateDelegate('fill');
        });

    this.el.select('.stroke input')
        .property('value', this.primitive.stroke.value)
        .on('change', function() {
            vde.ui.inspector.updateProperty.call(self, 'stroke');
            self.updateDelegate('stroke');
        });

    this.el.select('.strokeWidth input')
        .property('value', this.primitive.strokeWidth.value)
        .on('change', function() {
            vde.ui.inspector.updateProperty.call(self, 'strokeWidth');
            self.updateDelegate('strokeWidth', 'stroke-width');
        });
};

vde.ui.inspector.rect.updateDelegate = function(property, style) {
    style || (style = property);
    this.el.select('rect').style(style, vde.ui.inspector.getProperty.call(this, property));
};

