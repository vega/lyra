vde.ui.panel = function(idx) {
    this.idx    = idx;
    this.id     = 'panel_' + this.idx;
    this.panel  = null;

    this.visWidth  = 500;
    this.visHeight = 350;
    this.sidebarWidth = 250;
    this.toolbarHeight = 32;

    this.paddingX = 20;
    this.paddingY = 20;

    this.spec   = new vde.spec()
        .set('name', 'vis_' + this.idx)
        .set('width', this.visWidth)
        .set('height', this.visHeight);

    this.scales = {};
    this.axes   = {};
    this.marks  = {};

    this.build();

    return this;
};

vde.ui.panel.prototype.id = function(id) {
    if (!arguments.length) return '#' + this.id;
    this.id = id;
    return this;
};

vde.ui.panel.prototype.panel = function(panel) {
    if (!arguments.length) return this.panel;
    this.panel = panel;
    return this;    
};

vde.ui.panel.prototype.width = function() {
    return this.visWidth + this.sidebarWidth + this.paddingX;
};

vde.ui.panel.prototype.height = function() {
    return this.visHeight + this.toolbarHeight*2 + this.paddingY;
};

vde.ui.panel.prototype.compile = function() {
    this.spec.compile();
    this.spec.vis.load(function() {
        if(this.spec.el() == null)
            this.spec.vis.el(this.id() + ' .vis').data({'table': vde.data[0]}).init()

        this.spec.vis.update();
    });
}

vde.ui.panel.prototype.build = function() {
    var self = this;
    this.panel =  d3.select('body')
        .append('div')
        .attr('id', this.id)
        .classed('panel', true)
        .style('width', this.width() + 'px')
        .style('height', this.height() + 'px')
        .on('mouseover', function() {
            self.onHover(this);
        })
        .on('mouseout', function() {
            self.onOut(this);
        });

    this.panel.append('div')
        .classed('toolbar', true)
        .classed('primitives', true)
        .style('width', this.visWidth + 'px')
        .style('height', this.toolbarHeight + 'px');

    this.panel.append('div')
        .classed('vis', true)
        .style('width', this.visWidth + 'px')
        .style('height', this.visHeight + 'px');

    this.panel.append('div')
        .classed('sidebar', true)
        .classed('inspector', true)
        .style('width', this.sidebarWidth + 'px')
        .style('height', this.visHeight + 'px');

    this.panel.append('div')
        .classed('toolbar', true)
        .classed('data', true)
        .style('width', this.visWidth + 'px')
        .style('height', this.toolbarHeight + 'px');
};

vde.ui.panel.prototype.onHover = function(target) {
    var pToolbar = this.panel.select('.primitives')
        .html('')
        .append('ul');

    Object.keys(vde.primitives).forEach(function(type) {
        var primitive = eval('new vde.primitives.' + type + '(this)');
        if(!primitive.toolbar)
            return;

        pToolbar.append('li')
            .classed(type, true)
            .text(type);
    });

    this.panel.selectAll('.toolbar, .sidebar')
        .style('display', 'block');
}

vde.ui.panel.prototype.onOut = function(target) {
    this.panel.selectAll('.toolbar, .sidebar')
        .style('display', 'none');
};
