vde.ui.inspector = {};

vde.ui.inspector.load = function(primitive) {
    var inspectorFor = primitive.getClass().toLowerCase();

    d3.select('head').append('script')
                .attr('src', 'lib/vde/ui/inspectors/'+inspectorFor+'.js');

    d3.xhr('lib/vde/ui/inspectors/'+inspectorFor+'.html', function(error, response) {
        vde.ui.inspector[inspectorFor] = {};

        var id = 'inspector_' + inspectorFor;
        var inspector = d3.select('body').selectAll('div#'+id).data([1]);
        inspector.enter().append('div')
            .attr('id', id)
            .attr('inspector_for', inspectorFor)
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
        inspector.selectAll('.value')
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

vde.ui.inspector.for = function(el) {
    return d3.select(el.node().parentNode).attr('inspector_for');
};

vde.ui.inspector.show = function(primitive, loc) {
    var inspectorFor = primitive.getClass().toLowerCase();
    var inspector = d3.select('div#inspector_' + inspectorFor);
    inspector.style('left', (loc[0] - parseInt(inspector.style('width'))) + 'px')
        .style('top',  loc[1] + 'px')
        .style('display', 'block');

    vde.ui.inspector[inspectorFor].init(primitive);
};

vde.ui.inspector.close = function(el) { 
    el.style('display', 'none'); 
    return vde.ui.inspector[el.attr('inspector_for')].close();
};

vde.ui.inspector.loadValues = function(primitive) {
    var inspectorFor = primitive.getClass().toLowerCase();
    var inspector = d3.select('div#inspector_' + inspectorFor);

    var values = primitive.inspectorValues();
    vg.keys(values).forEach(function(k) {
        var field_el = inspector.select('div[field=' + k + ']');
        field_el.selectAll('.capsule').remove();

        if(values[k] instanceof vde.primitives.Scale) {
            var spec = values[k].spec;
            var opts = {
                src: spec.domain.data,
                field: spec.domain.field.replace('data.', ''),
                index: (spec.domain.field == 'index')
            };
            vde.ui.inspector.buildCapsule(field_el, opts);
        } else {
            field_el.select('.value').style('display', 'block');
            if(!field_el.select('.value').empty() && values[k])
                field_el.select('.value').node().value = values[k].value;
        }
            
    });

    vde.ui.inspector[inspectorFor].loadValues();
}

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

vde.ui.inspector.buildCapsule = function(field, opts) {
    field.select('.value').style('display', 'none');
    field.classed('bound', true);

    var capsule = new vde.ui.Capsule(opts.src, opts.field, opts.index, true)
        .build(field);

    if(opts.index)
        capsule.el.select('span.name').text('BIN(# Records)');

    capsule.el.select('.delete').on('click', function() {
        capsule.el.remove();
        if(field.selectAll('.capsule').empty()) {
            var input = field.selectAll('input, select')
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
        field.classed('bound', false);     

        vde.parse();
    });
}

vde.ui.inspector.onChange = function() {
    var field_el = d3.select(this.parentNode);
    var field = field_el.attr('field');
    var inspectorFor = vde.ui.inspector.for(field_el);
    var primitive = vde.ui.inspector[inspectorFor].getPrimitive();

    primitive.properties[field] = {value: this.value};
    vde.ui.inspector[inspectorFor].updateDelegate(field, this.value);

    vde.parse();
};

vde.ui.inspector.onDrop = function() {
    var opts = JSON.parse(d3.event.dataTransfer.getData('vde.capsule'));
    var field_el = d3.select(this);
    
    vde.ui.inspector.buildCapsule(field_el, opts);

    var inspectorFor = vde.ui.inspector.for(field_el);
    vde.ui.inspector[inspectorFor].onDrop.call(this, opts, field_el);

    vde.parse();
};