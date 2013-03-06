vde.ui.inspector = {};

vde.ui.inspector.load = function(primitive) {
    var which = primitive.getClass().toLowerCase();

    d3.select('head').append('script')
                .attr('src', 'lib/vde/ui/inspectors/'+which+'.js');

    d3.xhr('lib/vde/ui/inspectors/'+which+'.html', function(error, response) {
        vde.ui.inspector[which] = {};

        var id = 'inspector_' + which;
        var inspector = d3.select('body').selectAll('div#'+id).data([1]);
        inspector.enter().append('div')
            .attr('id', id)
            .attr('which_inspector', which)
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

        // Don't drag the inspector if we're dragging an input
        inspector.selectAll('input, select')
            .on('mousedown', function() {
                d3.event.stopPropagation();
            })
            .on('change', vde.ui.inspector.onChange);

        inspector.selectAll('.field label.expand, .field label.contract')
            .on('click', function() {
                vde.ui.inspector.toggleField(id, d3.select(this.parentNode).attr('field'));
            });

        inspector.selectAll('.field')
            .on('dragenter', vde.ui.cancelDrag)
            .on('dragover', vde.ui.cancelDrag)
            .on('drop', vde.ui.inspector.onDrop);
    });
};

vde.ui.inspector.whichFromField = function(el) {
    return d3.select(el.node().parentNode).attr('which_inspector');
};

vde.ui.inspector.show = function(primitive, loc) {
    var which = primitive.getClass().toLowerCase();
    var inspector = d3.select('div#inspector_' + which);
    inspector.style('left', (loc[0] - parseInt(inspector.style('width'))) + 'px')
        .style('top',  loc[1] + 'px')
        .style('display', 'block');

    vde.ui.inspector[which].init(primitive);
};

vde.ui.inspector.close = function(el) { 
    el.style('display', 'none'); 
    return vde.ui.inspector[el.attr('which_inspector')].close();
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

vde.ui.inspector.onChange = function() {
    var field_el = d3.select(this.parentNode);
    var field = field_el.attr('field');
    var which = vde.ui.inspector.whichFromField(field_el);
    var primitive = vde.ui.inspector[which].getPrimitive();

    primitive.properties[field] = {value: this.value};
    vde.ui.inspector[which].updateDelegate(field, this.value);

    vde.parse();
};

vde.ui.inspector.onDrop = function() {
    var opts = JSON.parse(d3.event.dataTransfer.getData('vde.capsule'));
    var field_el = d3.select(this);
    field_el.select('.value').style('display', 'none');
    field_el.classed('bound', true);

    var capsule = new vde.ui.Capsule(opts.src, opts.field, opts.index, true)
        .build(field_el);

    if(opts.index)
        capsule.el.select('span.name').text('BIN(# Records)');

    capsule.el.select('.delete').on('click', function() {
        capsule.el.remove();
        if(field_el.selectAll('.capsule').empty()) {
            var input = field_el.select('.value')
                .style('display', 'block');

            var node = input.node();
            if ("fireEvent" in node)
                node.fireEvent("onchange");
            else {
                var evt = document.createEvent("HTMLEvents");
                evt.initEvent("change", false, true);
                node.dispatchEvent(evt);
            }
        }       
        field_el.classed('bound', false);     

        vde.parse();
    });

    var which = vde.ui.inspector.whichFromField(field_el);
    vde.ui.inspector[which].onDrop.call(this, opts, field_el);

    vde.parse();
}