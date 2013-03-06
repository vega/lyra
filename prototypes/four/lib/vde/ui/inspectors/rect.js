(function() {
    var el = d3.select('#inspector_rect');
    var inspector = vde.ui.inspector.rect;
    var rect = null;

    inspector.init = function(primitive) {
        rect = primitive;
    };

    inspector.close = function() {
        rect = null;
    };

    inspector.onDrop = function(opts, field_el) {
        var field = field_el.attr('field');

        rect.spec.from = {data: opts.src};

        // TODO: orientation of bar (i.e. in vertical, width is ordinal
        // but in horizontal, height would be ordinal).
        var domain = {
            data: opts.src, 
            field: (opts.field == 'index') ? ['index'] : ['data', opts.field]
        };

        switch(field) {
            case 'height':
                var scale = rect.group.scale({
                    type: 'linear',
                    range: 'height',
                    nice: true,
                    domain: domain
                });

                rect
                  .enter('y', {
                    scale: scale.spec.name,
                    field: domain.field
                  })
                  .enter('y2', {
                    scale: scale.spec.name,
                    value: 0
                  });
            break;

            case 'width':
                var scale = rect.group.scale({
                    type: 'ordinal',
                    range: 'width',
                    domain: domain
                });

                rect
                  .enter('x', {
                    scale: scale.spec.name,
                    field: domain.field
                  })
                  .enter('width', {
                    scale: scale.spec.name,
                    band: true,
                    offset: -1
                  });                
            break;

            case 'fill':
            case 'stroke':
                var scale = rect.group.scale({
                    type: 'ordinal',
                    range: 'category20',
                    domain: domain
                });

                rect.enter(field, {
                    scale: scale.spec.name,
                    field: domain.field
                });
            break;
        }
    };

})();