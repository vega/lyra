vde.ui = {};

vde.ui.init = function() {
    // Initialize each primitive's specific UI (e.g. inspectors)
    var rect = new vde.primitives.marks.Rect;
    rect.initUI();

    this.regEvtHandlers();
};

vde.ui.addPrimitiveToolbar = function(primitive) {
    d3.select('#primitives ul').append('li')
        .classed(primitive.type, true)
        .text(primitive.type)
        .attr('draggable', 'true')
        .on('dragstart', function() {
            d3.event.dataTransfer.effectAllowed = 'copy';
            d3.event.dataTransfer.setData('vde.primitive', primitive.type);
            return primitive.toolbarDragStart(d3.event);
        })
        .on('dragend', function() { return primitive.toolbarDragEnd(d3.event); });
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

    var indexCapsule = new vde.ui.Capsule(src, 'index', false, true).build(toolbar);
    indexCapsule.el.attr('draggable', 'true')
        .on('dragstart', function() {
            return dragstart(src, 'index', true);
        })
        .on('dragend', dragend);

    Object.keys(vde.data[src].values[0]).forEach(function(field) {
        var p = new vde.ui.Capsule(src, field, false).build(toolbar);
        p.el.attr('draggable', 'true')
            .on('dragstart', function() {
                return dragstart(src, field, false);
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
};

vde.ui.regEvtHandlers = function() {
    var self = this;


};