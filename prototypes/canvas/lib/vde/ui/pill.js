vde.ui.pill = function(src, field, controls) {
    this.source = src;
    this.field  = field;
    this.controls = controls;

    this.id = src + '_' + field + '_' + Date.now();
    this.el = null;

    return this;
};

vde.ui.pill.prototype.build = function(container) {
    this.el = container.append('div')
        .attr('id', this.id)
        .classed('pill', true)
        .classed('show-controls', this.controls)
        .classed('datasrc-' + this.source, true);

    this.el.append('span')
        .classed('close', true)
        .html('x');

    this.el.append('span')
        .classed('field', true)
        .html(this.field);

    this.el.append('span')
        .classed('expand', true)
        .html('&#x25BC;');

    return this;
};