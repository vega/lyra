vde.ui.panel = function(idx) {
    this.idx    = idx;
    this.id     = 'panel_' + this.idx;
    this.el  = null;

    this.visWidth  = 450;
    this.visHeight = 300;
    this.sidebarWidth = 250;
    this.toolbarHeight = 32;

    this.visPadding   = 25;
    this.panelPadding = 20;

    this.visDragging  = null;
    this.mouseDownCoords = null;
    this.duration = null;

    this.spec   = new vde.spec()
        .set('name', 'vis_' + this.idx)
        // .set('padding', this.visPadding)
        .set('duration', 500);

    this.scales = {};
    this.axes   = {};
    this.marks  = {};

    this.view   = {};

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

    this.spec
        .set('data', [{'name': 'dummy', 'values': vde.data.dummy}])
        .parse(function(chart) {
            self.el.select('.vis').selectAll('*').remove();
            (self.view = chart('.vis')).update();
            self.registerVisEvents();
        });

    this.resetDuration(false);

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
        .on('mousemove', function() { 
            self.resize(); 
            if(self.visDragging)
                self.visDragging.visMouseMove(d3.event);
        })
        .on('dragenter', cancelDrag)
        .on('dragover', cancelDrag)
        .on('drop', function() {
            var type = d3.event.dataTransfer.getData('vde.primitive');
            if(!type)
                return false;

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
                d3.event.dataTransfer.setData('vde.primitive', type);
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

    this.resetDuration(true);

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

vde.ui.panel.prototype.registerVisEvents = function() {
    var self = this;
    var opacities = {marks: 0.9, axes: 0.6};

    // Go up the path until you can get to the definition
    // for a primtive. 
    var getPrimitiveFromView = function(item) {
        var def = {};
        item.path.some(function(i) {
            if(i.hasOwnProperty('def')) {
                def = i;
                return i;
            }
        });

        return self.marks[def.def.name];
    };

    this.view
        .on('mousedown', function(e, item) {
            e.preventDefault();
            var p = getPrimitiveFromView(item);
            self.visDragging = p; 
            self.mouseDownCoords = d3.mouse(self.el.select('.vis svg').node()); 
            return p.visMouseDown(e); 
        })
        .on('mouseup', function(e, item) {
            var p = getPrimitiveFromView(item);
            p.visMouseUp(e); 
            self.visDragging = null; 
            self.mouseDownCoords = null; 
        })
        .on('mousemove', function(e, item) { return getPrimitiveFromView(item).visMouseMove(e); })
        .on('mouseover', function(e, item) { return getPrimitiveFromView(item).visMouseOver(e); })
        .on('mouseout',  function(e, item) { return getPrimitiveFromView(item).visMouseOut(e); })
        .on('dragstart', function(e, item) { return getPrimitiveFromView(item).visDragStart(e); })
        .on('dragend',   function(e, item) { return getPrimitiveFromView(item).visDragEnd(e); })
        .on('click', function(e, item) {
            var p = getPrimitiveFromView(item);
            var inspector = d3.select('#inspector_' + p.type);
                
            self.el.select('.sidebar')
                .style('display', 'block')
                .append('div')
                    .attr('id', 'inspector_' + p.type)
                    .html(inspector.html());

            // Remove the template from the document. When we close
            // the inspector, we'll re-create this.
            inspector.remove();

            vde.ui.inspector[p.type].init(p);

            return p.visClick(d3.event);
        });

    return this;
};

vde.ui.panel.prototype.resetDuration = function(zero) {
    if(zero) {
        this.duration = this.spec.get('duration');
        this.spec.set('duration', 0);
    } else if(this.duration) {
        this.spec.set('duration', this.duration);
        this.duration = null;
    }

    return this;
};