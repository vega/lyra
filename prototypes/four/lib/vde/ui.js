vde.ui = {dragging:null};

vde.ui.init = function() {
    // Initialize each primitive's specific UI (e.g. inspectors)
    var rect = new vde.primitives.marks.Rect;
    rect.initUI();

    this.regEvtHandlers();
};

vde.ui.addPrimitiveToolbar = function(primitive) {
    d3.select('#primitives ul').append('li')
        .classed(primitive.getType(), true)
        .text(primitive.getType())
        .attr('draggable', 'true')
        .on('dragstart', function() {
            d3.event.dataTransfer.effectAllowed = 'copy';
            d3.event.dataTransfer.setData('vde.primitive', primitive.getClass(true));
            return primitive.onToolbarDragStart(d3.event);
        })
        .on('dragend', function() { return primitive.onToolbarDragEnd(d3.event); });
};

vde.ui.addDataToolbar = function(src) {
    var toolbar = d3.select('#data');
    var srcList = toolbar.selectAll('select').data([1]);

    srcList.enter().append('select')
        .on('change', function() {
            toolbar.selectAll('.capsule').style('display', 'none');
            toolbar.selectAll('.datasrc-' + this.value).style('display', 'inline-block');
        })
        .append('option')
            .attr('value', '')
            .text('Data Sources');

    var dragstart = function(src, field, idx) {
        d3.selectAll('.inspector .field').style('border', '1px dashed #666');
        d3.event.dataTransfer.effectAllowed = 'copy';
        d3.event.dataTransfer.setData('vde.capsule', JSON.stringify({src: src, field: field, index: idx}));
        return false;
    };

    var dragend = function(idx) {
        d3.selectAll('.inspector .field').style('border', '1px dashed transparent');
    };

    srcList.append('option')
        .attr('value', src)
        .text(src);

    var indexCapsule = new vde.ui.Capsule(src, 'index', true).build(toolbar);
    indexCapsule.el.attr('draggable', 'true')
        .on('dragstart', function() {
            return dragstart(src, 'index', true);
        })
        .on('dragend', dragend);

    Object.keys(vde.data[src].values[0]).forEach(function(field) {
        var p = new vde.ui.Capsule(src, field).build(toolbar);
        p.el.attr('draggable', 'true')
            .on('dragstart', function() {
                return dragstart(src, field);
            })
            .on('dragend', dragend);
    });

    toolbar.selectAll('.capsule').style('display', 'none');
    toolbar
        .on('mouseover', function() { d3.select(this).style('height', this.scrollHeight + 'px'); })
        .on('mouseout',  function() { d3.select(this).style('height', '32px'); })

    return this;    
};

vde.ui.render = function(chart) {
    d3.select('#vis').selectAll('*').remove();
    (vde.view = chart('#vis')).update();

    vde.ui.regEvtHandlers();
};

vde.ui.cancelDrag = function() { d3.event.preventDefault(); return false; };

vde.ui.regEvtHandlers = function() {
    var self = this;

    d3.select('#vis')
        .on('dragenter', vde.ui.cancelDrag)
        .on('dragover', vde.ui.cancelDrag)
        .on('drop', function() {
            var pClass = d3.event.dataTransfer.getData('vde.primitive');
            if(!pClass)
                return false;

            var primitive = eval('new ' + pClass + '("primitive_' + Date.now() + '")');
            primitive.onToolbarDrop(d3.event);

            vde.parse();
        });

    if(!vde.view)
        return;

    // Go up the path until you can get to the mark
    var getMarkFromView = function(obj, type) {
        if(obj.mark.marktype == type)
            return obj;
        else if(obj.mark.group)
            return getMarkFromView(obj.mark.group, type)

        return null;
    };

    vde.view.on('mouseover', function(e, i) {
        // Outline the group container
        var group = getMarkFromView(i, 'group');
        if(!group.stroke || group.strokeWidth < 1) {
            group.stroke = '#ccc';
            group.strokeWidth = '1';
            group.vdeStroke = true;
            vde.view.render();
        }        
    }).on('mouseout', function(e, i) {
        // Remove group container outline
        var group = getMarkFromView(i, 'group');
        if(group.vdeStroke) {
            group.strokeWidth = '0';
            vde.view.render();
        }        
    });
};