vde.ui.panel = function(idx) {
    this.idx    = idx;
    this.id     = 'panel_' + this.idx;
    this.el  = null;

    this.visWidth  = 450;
    this.visHeight = 300;
    this.sidebarWidth = 250;
    this.toolbarHeight = 32;

    this.visPadding   = 30;
    this.panelPadding = 20;

    this.spec   = new vde.spec()
        .set('name', 'vis_' + this.idx)
        .set('width', this.visWidth)
        .set('height', this.visHeight)
        .set('padding', this.visPadding)
        .set('duration', 500);

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

vde.ui.panel.prototype.el = function(el) {
    if (!arguments.length) return this.el;
    this.el = panel;
    return this;    
};

vde.ui.panel.prototype.width = function() {
    return this.visWidth + 2*this.visPadding + this.sidebarWidth + 2*this.panelPadding;
};

vde.ui.panel.prototype.height = function() {
    return this.visHeight + 2*this.visPadding + 2*this.toolbarHeight + 2*this.panelPadding;
};

vde.ui.panel.prototype.compile = function() {
    var self = this;
    this.spec.set('data', [{'name': 'table'}]).compile();
    this.spec.vis.load(function() {
        if(self.spec.vis.el() == null)
            self.spec.vis.el('#' + self.id + ' .vis').data({'table': vde.data[0]}).init()

        self.spec.vis.update();
    });
}

vde.ui.panel.prototype.build = function() {
    var self = this;
    this.el =  d3.select('body')
        .append('div')
        .attr('id', this.id)
        .classed('panel', true)
        .style('width', this.width() + 'px')
        .style('height', this.height() + 'px');

    this.el.append('div')
        .classed('toolbar', true)
        .classed('primitives', true)
        .style('width', (this.visWidth + 2*this.visPadding) + 'px')
        .style('height', this.toolbarHeight + 'px');

    this.buildPrimitives();

    this.el.append('div')
        .classed('vis', true)
        .style('width', (this.visWidth + 2*this.visPadding) + 'px')
        .style('height', (this.visHeight + 2*this.visPadding) + 'px')
        .on('dragenter', function() {
            d3.event.preventDefault();
            return false;
        })
        .on('dragover', function() {
            d3.event.preventDefault();
            return false;
        })
        .on('drop', function() {
            var type = d3.event.dataTransfer.getData('text/plain');
            var primitive = eval('new vde.primitives.' + type + '(self, "' + self.id + '_' + type + '")');
            return primitive.onDrop(d3.event);
        });

    this.el.append('div')
        .classed('sidebar', true)
        .classed('inspector', true)
        .style('width', this.sidebarWidth + 'px')
        .style('height', (this.visHeight + 2*this.visPadding) + 'px');

    this.el.append('div')
        .classed('toolbar', true)
        .classed('data', true)
        .style('width', (this.visWidth + 2*this.visPadding) + 'px')
        .style('height', this.toolbarHeight + 'px');
};

vde.ui.panel.prototype.buildPrimitives = function() {
    var self = this;
    var pToolbar = this.el.select('.primitives')
        .html('')
        .append('ul');

    Object.keys(vde.primitives).forEach(function(type) {
        var primitive = eval('new vde.primitives.' + type + '(self)');
        if(!primitive.toolbar)
            return;

        pToolbar.append('li')
            .classed(type, true)
            .text(type)
            .attr('draggable', 'true')
            .on('dragstart', function() {
                d3.event.dataTransfer.effectAllowed = 'copy';
                d3.event.dataTransfer.setData('text/plain', type);
            });
    });

    return pToolbar;
};