(function() {
    var el = d3.select('#inspector_rect');
    var inspector = vde.ui.inspector.rect;
    var rect = null;

    inspector.init = function(primitive) {
        rect = primitive;

        // For now, hide x1/x2/y1/y2
        el.selectAll('.height-expanded, .width-expanded').style('display', 'none')
        el.selectAll('.contract').classed('expand', true).classed('contract', false);
    };

    inspector.close = function() { rect = null; };

    inspector.getPrimitive = function() { return rect; };

    inspector.loadValues = function() {};

    inspector.updateDelegate = function(property, value) {
        if(property == 'strokeWidth')
            property = 'stroke-width';

        el.select('rect').style(property, value);
    }

    inspector.onDrop = function(opts, field_el) {
        var field = field_el.attr('field');

        rect.spec.from = {data: opts.src};

        // TODO: orientation of bar (i.e. in vertical, width is ordinal
        // but in horizontal, height would be ordinal).
        var scaleSpec = {};
        var domain = {
            data: opts.src, 
            field: (opts.field == 'index') ? 'index' : 'data.'+opts.field
        };

        switch(field) {
            case 'height':
                scaleSpec = {
                    type: 'linear',
                    range: 'height',
                    nice: true,
                    domain: domain
                };
            break;

            case 'width':
                scaleSpec = {
                    type: 'ordinal',
                    range: 'width',
                    domain: domain
                };             
            break;

            case 'fill':
            case 'stroke':
                scaleSpec = {
                    type: 'ordinal',
                    range: 'category20',
                    domain: domain
                };
            break;
        }

        rect.properties[field] = rect.group.scale(scaleSpec);
    };

})();