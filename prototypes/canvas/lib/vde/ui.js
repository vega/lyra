vde.ui = {
    panels: []
};

vde.ui.init = function() {
    // Load a default panel if we've not imported others
    if(this.panels.length == 0)  
        this.panels.push(new this.panel(this.panels.length));

    this.loadPrimitives();
};

vde.ui.loadPrimitives = function() {
    var container = d3.select('body').append('div')
        .attr('id', 'primitives')
        .classed('primitives', true)
        .append('ul');

    vde.primitives.forEach(function(primitive) {
        container.append('li')
            .classed(primitive, true)
            .text(primitive);
    });
}