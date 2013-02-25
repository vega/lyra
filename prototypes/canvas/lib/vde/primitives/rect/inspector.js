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

    var drop = function() {
        var opts = JSON.parse(d3.event.dataTransfer.getData('vde.pill'));
        var field = d3.select(this);
        field.select('.default').style('display', 'none');
        field.selectAll('.pill').remove();
        var p = new vde.ui.pill(opts.src, opts.field, true).build(field);
        p.el.select('.delete').on('click', function() {
            field.select('.pill').remove();
            field.select('.default').style('display', 'block');
            field.classed('bound', false);
        });
        field.classed('bound', true);
    }

    this.el.select('.height')
        .on('dragenter', vde.ui.inspector.onDragEnter)
        .on('dragleave', vde.ui.inspector.onDragLeave)
        .on('dragover', vde.ui.cancelDrag)
        .on('drop', drop);

    this.el.select('.width')
        .on('dragenter', vde.ui.inspector.onDragEnter)
        .on('dragleave', vde.ui.inspector.onDragLeave)
        .on('dragover', vde.ui.cancelDrag)
        .on('drop', drop);

    this.el.select('.fill')
        .on('dragenter', vde.ui.inspector.onDragEnter)
        .on('dragleave', vde.ui.inspector.onDragLeave)
        .on('dragover', vde.ui.cancelDrag)
        .on('drop', drop);

    this.el.select('.stroke')
        .on('dragenter', vde.ui.inspector.onDragEnter)
        .on('dragleave', vde.ui.inspector.onDragLeave)
        .on('dragover', vde.ui.cancelDrag)
        .on('drop', drop);

    this.el.select('.strokeWidth')
        .on('dragenter', vde.ui.inspector.onDragEnter)
        .on('dragleave', vde.ui.inspector.onDragLeave)
        .on('dragover', vde.ui.cancelDrag)
        .on('drop', drop);

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
};

vde.ui.inspector.rect.updateDelegate = function(property, style) {
    style || (style = property);
    this.el.select('rect').style(style, vde.ui.inspector.getProperty.call(this, property));
};

