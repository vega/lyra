vde.ui.inspector = {};

vde.ui.inspector.load = function(primitive) {
    var type = primitive.getClass().toLowerCase();

    d3.select('head').append('script')
                .attr('src', 'lib/vde/ui/inspectors/'+type+'.js');

    d3.xhr('lib/vde/ui/inspectors/'+type+'.html', function(error, response) {
        vde.ui.inspector[type] = {};

        var id = 'inspector_' + type;
        var inspector = d3.select('body').selectAll('div#'+id).data([1]);
        inspector.enter().append('div')
            .attr('id', id)
            .attr('inspector_type', type)
            .classed('inspector', true)
            .html(response.responseText)
            .style('display', 'none')
            .on('mousedown', function() {
                vde.ui.dragging = {
                    el: d3.select(this).attr('id'),
                    old: d3.mouse(this)
                };
            })
            .on('mousemove', function() {
                var inspector = d3.select(this);
                if(!vde.ui.dragging || vde.ui.dragging.el != inspector.attr('id'))
                    return;

                var coords  = d3.mouse(this);
                var oldLeft = parseInt(inspector.style('left'));
                var oldTop  = parseInt(inspector.style('top'));

                inspector.style('left', (oldLeft + coords[0] - vde.ui.dragging.old[0]) + 'px')
                    .style('top', (oldTop + coords[1] - vde.ui.dragging.old[1]) + 'px');
                
            })
            .on('mouseup', function() {
                if(vde.ui.dragging && vde.ui.dragging.el == d3.select(this).attr('id'))
                    vde.ui.dragging = null;
            })
            .append('div')
                .classed('close', true)
                .text('X')
                .on('click', function() {
                    vde.ui.inspector.close(inspector)
                });

        inspector.selectAll('.field label.expand, .field label.contract').on('click', function() {
            vde.ui.inspector.toggleField(id, d3.select(this.parentNode).attr('field'));
        });

        inspector.selectAll('.field')
            .on('dragenter', vde.ui.cancelDrag)
            .on('dragover', vde.ui.cancelDrag)
            .on('drop', vde.ui.inspector.onDrop);
    });
};

vde.ui.inspector.show = function(primitive, loc) {
    var type = primitive.getClass().toLowerCase();
    var inspector = d3.select('div#inspector_' + type);
    inspector.style('left', (loc[0] - parseInt(inspector.style('width'))) + 'px')
        .style('top',  loc[1] + 'px')
        .style('display', 'block');

    vde.ui.inspector[type].init(primitive);
};

vde.ui.inspector.close = function(el) { 
    el.style('display', 'none'); 
    return vde.ui.inspector[el.attr('inspector_type')].close();
};

vde.ui.inspector.toggleField = function(id, field) {
    var inspector = d3.select('div#' + id);
    fClass = '.' + field;
    var lbl = inspector.select(fClass + ' label');
    if(lbl.classed('expand')) {
        lbl.classed('expand', false).classed('contract', true);
        inspector.selectAll(fClass + '-expanded').style('display', 'block');
        inspector.selectAll(fClass + ' .default').style('display', 'none');
    } else {
        lbl.classed('expand', true).classed('contract', false);
        inspector.selectAll(fClass + '-expanded').style('display', 'none');
        inspector.selectAll(fClass + ' .default').style('display', 'block');
    }
};

vde.ui.inspector.onDrop = function(e) {
    var opts = JSON.parse(d3.event.dataTransfer.getData('vde.capsule'));
    var field_el = d3.select(this);
    field_el.select('.value').style('display', 'none');
    field_el.classed('bound', true);

    var capsule = new vde.ui.Capsule(opts.src, opts.field, opts.index, true)
        .build(field_el);

    if(opts.index)
        capsule.el.select('span.name').text('BIN(# Records)');

    var type = d3.select(field_el.node().parentNode).attr('inspector_type');
    vde.ui.inspector[type].onDrop.call(this, opts, field_el);

    vde.parse();
}