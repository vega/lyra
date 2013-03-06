vde.ui.Capsule = function(src, field, index, controls) {
    this.src      = src;
    this.field    = field;
    this.index    = index;
    this.controls = controls;

    this.id = src + '_' + field + '_' + Date.now();
    this.el = null;

    return this;
};

vde.ui.Capsule.prototype.build = function(container) {
    this.el = container.append('div')
        .attr('id', this.id)
        .classed('capsule', true)
        .classed('show-controls', this.controls)
        .classed('index', this.index)
        .classed('datasrc-' + this.src, true);

    this.el.append('span')
        .classed('delete', true)
        .html('x');

    this.el.append('span')
        .classed('name', true)
        .html(this.index ? '# Records' : this.field);

    this.el.append('span')
        .classed('expand', true)
        .html('&#x25BC;');

    return this;
};