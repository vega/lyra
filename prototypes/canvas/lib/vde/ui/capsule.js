vde.ui.capsule = function(src, field, controls) {
    this.src = src;
    this.field  = field;
    this.controls = controls;

    this.id = src + '_' + field + '_' + Date.now();
    this.el = null;

    this.panel = null;
    this.scale = null;

    return this;
};

vde.ui.capsule.prototype.build = function(container) {
    this.el = container.append('div')
        .attr('id', this.id)
        .classed('capsule', true)
        .classed('show-controls', this.controls)
        .classed('datasrc-' + this.src, true);

    this.el.append('span')
        .classed('delete', true)
        .html('x');

    this.el.append('span')
        .classed('name', true)
        .html(this.field);

    this.el.append('span')
        .classed('expand', true)
        .html('&#x25BC;');

    return this;
};

vde.ui.capsule.prototype.init = function(panel, scaleType) {
    this.panel = panel;
    this.panel.capsules[this.id] = this;
    this.scale = new vde.primitives.scale(this.panel, this.id)
        .prop('domain', this.domain());

    return this;
};

vde.ui.capsule.prototype.domain = function() {
    return {'data': this.src, 'field': ['data', this.field]};
};