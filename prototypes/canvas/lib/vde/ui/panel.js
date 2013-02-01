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
        .set('padding', this.visPadding)
        .set('duration', 500);

    this.scales = {};
    this.axes   = {};
    this.marks  = {};

    this.build().resize();

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
    if(this.spec.spec.marks.length == 0)
        return;

    this.spec.set('data', [{'name': 'dummy'}]).compile();
    this.spec.vis.load(function() {
        self.spec.vis.el('#' + self.id + ' .vis').data({'dummy': vde.data.dummy}).init().update();
        self.registerHover('marks').registerHover('axes');
    });

    return this;
}

vde.ui.panel.prototype.build = function() {
    var self = this;
    this.el =  d3.select('body')
        .append('div')
        .attr('id', this.id)
        .classed('panel', true);

    this.el.append('div')
        .classed('toolbar', true)
        .classed('primitives', true);

    this.buildPrimitives();

    var cancelDrag = function() { d3.event.preventDefault(); return false; };

    this.el.append('div')
        .classed('vis', true)
        .on('mousemove', function() { self.resize(); })
        .on('dragenter', cancelDrag)
        .on('dragover', cancelDrag)
        .on('drop', function() {
            var type = d3.event.dataTransfer.getData('text/plain');
            var primitive = eval('new vde.primitives.' + type + '(self, "' + self.id + '_' + type + '")');
            return primitive.toolbarDrop(d3.event);
        });

    this.el.append('div')
        .classed('sidebar', true)
        .style('display', 'none');

    // this.el.append('div')
    //     .classed('toolbar', true)
    //     .classed('data', true);

    return this;
};

vde.ui.panel.prototype.buildPrimitives = function() {
    var self = this;
    var pToolbar = this.el.select('.primitives')
        .html('')
        .append('ul');

    Object.keys(vde.primitives).forEach(function(type) {
        var primitive = eval('new vde.primitives.' + type + '(self, "' + self.id + '_' + type + '")');
        if(!primitive.toolbar)
            return;

        pToolbar.append('li')
            .classed(type, true)
            .text(type)
            .attr('draggable', 'true')
            .on('dragstart', function() {
                d3.event.dataTransfer.effectAllowed = 'copy';
                d3.event.dataTransfer.setData('text/plain', type);
                return primitive.toolbarDragStart(d3.event);
            })
            .on('dragend', function() { return primitive.toolbarDragEnd(d3.event); });
    });

    return this;
};

vde.ui.panel.prototype.resize = function() {
    var vis = this.el.select('.vis');
    var visWidth  = parseFloat(vis.style('width'));
    var visHeight = parseFloat(vis.style('height'));

    if(visWidth == (this.visWidth + 2*this.visPadding) && 
        visHeight == (this.visHeight + 2*this.visPadding))
        return false;

    this.visWidth  = (visWidth > 0) ? visWidth - 2*this.visPadding : this.visWidth;
    this.visHeight = (visHeight > 0) ? visHeight - 2*this.visPadding : this.visHeight;

    this.el.style('width', this.width() + 'px')
        .style('height', this.height() + 'px');

    this.el.select('.vis')
        .style('width', (this.visWidth + 2*this.visPadding) + 'px')
        .style('height', (this.visHeight + 2*this.visPadding) + 'px');

    this.el.select('.vis div svg')
        .attr('width', (this.visWidth + 2*this.visPadding))
        .attr('height', (this.visHeight + 2*this.visPadding));

    this.el.select('.primitives')
        .style('width', (this.visWidth + 2*this.visPadding) + 'px')
        .style('height', this.toolbarHeight + 'px');

    this.el.select('.sidebar')
        .style('width', this.sidebarWidth + 'px')
        .style('height', (this.visHeight + 2*this.visPadding) + 'px');

    this.spec.set('width', this.visWidth)
        .set('height', this.visHeight);

    this.compile();

    return this;
};

vde.ui.panel.prototype.registerHover = function(primitives) {
    var self = this;
    Object.keys(self[primitives]).forEach(function(name) {
        var type = self[primitives][name].type;

        self.el.select('g.'+name)
            .on('mouseover', function() { d3.select(this).style('opacity', 0.9); })
            .on('mouseout',  function() { d3.select(this).style('opacity', 1.0); })
            .on('click', function() {
                d3.select(this).style('opacity', 0.9);

                var inspector = d3.select('#inspector_' + type);
                    
                self.el.select('.sidebar')
                    .style('display', 'block')
                    .append('div')
                        .attr('id', 'inspector_' + type)
                        .html(inspector.html());

                inspector.remove();

                vde.ui.inspector[type].init(self[primitives][name]);
            });
    });

    return this;
};