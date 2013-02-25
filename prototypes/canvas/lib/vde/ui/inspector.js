vde.ui.inspector = {};

vde.ui.inspector.init = function() {
    var self = this;
    this.el.select('.close')
        .on('click', function() {
            vde.ui.inspector.close.call(self);
        });
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
    this.primitive[property] = vde.ui.inspector.getProperty.call(this, property);
    this.primitive.update();
};

vde.ui.inspector.updateScaleDomain = function(scale, property) {
    var scaleValue = vde.ui.inspector.getProperty.call(this, property).split(':');
    this.primitive[scale] = {'data': scaleValue[0], 'field': ['data', scaleValue[1]] };
    this.primitive.update();
}

vde.ui.inspector.close = function() {
    d3.select('body').append('div')
        .attr('id', this.el.attr('id'))
        .html(this.el.html())
        .style('display', 'none');

    d3.select(this.el.node().parentNode)
        .style('display', 'none');

    this.el.remove();
};