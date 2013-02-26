vde.ui.inspector = {};

vde.ui.inspector.init = function() {
    var self = this;
    this.el.select('.close')
        .on('click', function() {
            vde.ui.inspector.close.call(self);
        });
};

vde.ui.inspector.show = function(panel, primitive) {
    var inspector = d3.select('#inspector_' + primitive.type);
        
    panel.el.select('.sidebar')
        .style('display', 'block')
        .append('div')
            .attr('id', 'inspector_' + primitive.type)
            .html(inspector.html());

    // Remove the template from the document. When we close
    // the inspector, we'll re-create this.
    inspector.remove();

    vde.ui.inspector[primitive.type].init(primitive);
};

vde.ui.inspector.onDragEnter = function() {
    // d3.select(this).style('background', '#dddddd');
    return vde.ui.cancelDrag;
};

vde.ui.inspector.onDragLeave = function() {
    // d3.select(this).style('background', 'transparent');
};

vde.ui.inspector.getProperty = function(property) {
    return this.el.select('.' + property).selectAll('input, select').property('value');
};

vde.ui.inspector.getScaleDomain = function(scale) {
    var domain = this.primitive[scale];
    return domain.data + ':' + domain.field;
};

vde.ui.inspector.updateProperty = function(property) {
    this.primitive[property] = {'value': vde.ui.inspector.getProperty.call(this, property)};
    this.primitive.update();
};

vde.ui.inspector.close = function() {
    d3.select('body').append('div')
        .attr('id', this.el.attr('id'))
        .html(this.el.html())
        .style('display', 'none');

    d3.select(this.el.node().parentNode)
        .style('display', 'none');

    this.el.remove();
};