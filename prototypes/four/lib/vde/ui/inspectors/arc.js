(function() {
    var el = d3.select('#inspector_arc');
    var inspector = vde.ui.inspector.arc;
    var arc = null;

    inspector.init = function(primitive) {
        arc = primitive;

        el.selectAll('.innerRadius input, .outerRadius input').on('change', inspector.radiusChange);
    };

    inspector.close = function() { arc = null; };

    inspector.getPrimitive = function() { return arc; };

    inspector.loadValues = function() {
        var values = arc.inspectorValues();
        el.select('.innerRadius input').node().value = values.innerRadius.value;
        el.select('.outerRadius input').node().value = values.outerRadius.value;
    };

    inspector.updateDelegate = function(property, value) {
        if(property == 'strokeWidth')
            property = 'stroke-width';

        el.select('.arc').style(property, value);
    };

    inspector.onDrop = function(opts, field_el) {
        var field = field_el.attr('field');

        arc.spec.from = {data: opts.src};

        // TODO: orientation of bar (i.e. in vertical, width is ordinal
        // but in horizontal, height would be ordinal).
        var scaleSpec = {};
        var domain = {
            data: opts.src, 
            field: (opts.field == 'index') ? 'index' : 'data.'+opts.field
        };

        switch(field) {
            case 'angle':
                arc.properties.angle = {field: opts.field};
            break;

            case 'innerRadius':
            case 'outerRadius':
                arc.properties[field] = arc.group.scale({
                    type: 'sqrt',
                    range: 'width',
                    domain: domain
                });             
            break;

            case 'fill':
            case 'stroke':
                arc.properties[field] = arc.group.scale({
                    type: 'ordinal',
                    range: 'category20',
                    domain: domain
                });
            break;
        }
    };

    inspector.radiusChange = function() {
        var field_el = d3.select(this.parentNode);
        var field = field_el.attr('field');

        arc.properties.radiiRanges[(field == 'innerRadius') ? 0 : 1] = this.value;
        if(field_el.selectAll('.capsule').empty())
            arc.properties[field] = {value: this.value};

        vde.parse();
    };

})();