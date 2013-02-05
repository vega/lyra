vde.primitives.axis = function(panel, name) {
    this.name = name;
    this.type = 'axis';
    this.inspector = true;

    this.offset = 0;
    this.orient = null;
    this.axis = null;
    this.scale = null;

    this.dropZoneSize = 15;

    return vde.primitive.call(this, panel);
};

vde.primitives.axis.prototype = new vde.primitive();

vde.primitives.axis.prototype.spec = function() {
    return this.panel.spec.axis({'name': this.name}, {});
};

vde.primitives.axis.prototype.init = function(orient) {
    this.panel.axes[this.name] = this;
    this.orient = orient;
    this.axis = (orient == 'top' || orient == 'bottom') ? 'x' : 'y';
    this.scale = (this.axis == 'x') ? 'panel_0_rect_x' : 'panel_0_rect_y';

    return this;
};

vde.primitives.axis.prototype.update = function() {
    this.prop('scale', this.scale)
        .prop('axis', this.axis)
        .prop('orient', this.orient)
        .prop('offset', this.offset);

    this.panel.compile();

    return this;
};

// On dragstart, add dropzones to orient the axis
vde.primitives.axis.prototype.toolbarDragStart = function(e) {
    var self = new vde.primitives.axis(this.panel, this.name + '_' + Object.keys(this.panel.axes).length);
    var vis  = self.panel.el.select('.vis');

    var cancelDrag = function() { d3.event.preventDefault(); return false; };
    var dragEnter = function() { d3.select(this).style('background-color', 'rgba(255, 204, 102, 0.6)'); cancelDrag(); };
    var dragLeave = function() { d3.select(this).style('background-color', 'rgba(255, 255, 255, 1.0)'); };
    var drop = function(orient) { self.init(orient).update(); return false; }

    // Left
    vis.append('div')
        .classed('dropzone', true)
        .style('position', 'absolute')
        .style('left', 0)
        .style('top', 0)
        .style('width', self.dropZoneSize + 'px')
        .style('height', '100%')
        .style('border', '1px dashed #999')
        .on('dragenter', dragEnter)
        .on('dragleave', dragLeave)
        .on('dragover', cancelDrag)
        .on('drop', function() { return drop('left'); });

    // Right
    vis.append('div')
        .classed('dropzone', true)
        .style('position', 'absolute')
        .style('right', 0)
        .style('top', 0)
        .style('width', self.dropZoneSize + 'px')
        .style('height', '100%')
        .style('border', '1px dashed #999')
        .on('dragenter', dragEnter)
        .on('dragleave', dragLeave)
        .on('dragover',cancelDrag)
        .on('drop', function() { return drop('right'); });

    // Top
    vis.append('div')
        .classed('dropzone', true)
        .style('position', 'absolute')
        .style('left', 0)
        .style('top', 0)
        .style('width', '100%')
        .style('height', self.dropZoneSize + 'px')
        .style('border', '1px dashed #999')
        .on('dragenter', dragEnter)
        .on('dragleave', dragLeave)
        .on('dragover', cancelDrag)
        .on('drop', function() { return drop('top'); });

    // Bottom
    vis.append('div')
        .classed('dropzone', true)
        .style('position', 'absolute')
        .style('left', 0)
        .style('bottom', 0)
        .style('width', '100%')
        .style('height', self.dropZoneSize + 'px')
        .style('border', '1px dashed #999')
        .on('dragenter', dragEnter)
        .on('dragleave', dragLeave)
        .on('dragover', cancelDrag)
        .on('drop', function() { return drop('bottom'); });
};

vde.primitives.axis.prototype.toolbarDragEnd = function(e) {
    this.panel.el.select('.vis').selectAll('.dropzone').remove();
};

vde.primitives.axis.prototype.getOffset = function() {
    var coords  = d3.mouse(this.panel.el.select('.vis svg').node());
    var idx = (this.orient == 'left' || this.orient == 'right') ? 0 : 1;

    return this.offset + ((this.orient == 'left' || this.orient == 'top') ? 
        -(coords[idx] - this.panel.mouseDownCoords[idx]) : 
        (coords[idx] - this.panel.mouseDownCoords[idx]));
};

vde.primitives.axis.prototype.visMouseMove = function(e) {
    if(this.panel.visDragging != this)
        return false;

    this.prop('offset', this.getOffset());
    this.panel.resetDuration(true).compile();

    return false;
};

vde.primitives.axis.prototype.visMouseUp = function(e) {
    if(this.panel.visDragging != this)
        return false;

    this.offset = this.getOffset();
    this.update();

    return false;
};