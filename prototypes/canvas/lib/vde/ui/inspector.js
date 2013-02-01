vde.ui.inspector = {};

vde.ui.inspector.populateFields = function(property, allowDummy, allowCustom) {
    var menu = this.el.select('.' + property)
        .select('select');

    menu.html('');

    if(allowCustom)
        menu.append('option')
            .attr('value', 'custom')
            .text('Custom')

    Object.keys(vde.data).forEach(function(k, i) {
        if(i == 0 && !allowDummy)  // Dummy
            return;

        menu.append('option')
            .attr('value', '')
            .text(k);

        for(var f in vde.data[k][0])
            menu.append('option')
                .attr('value', k+':'+f)
                .html('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + f);
    });
};

vde.ui.inspector.getProperty = function(property) {
    return this.el.select('.' + property).selectAll('input, select').property('value');
};

vde.ui.inspector.getScaleDomain = function(scale) {
    var domain = this.primitive[scale];
    return domain.data + ':' + domain.field;
};

vde.ui.inspector.updateProperty = function(property) {
    this.primitive[property] = vde.ui.inspector.getProperty.call(this, property);
    this.primitive.update();
};

vde.ui.inspector.updateScaleDomain = function(scale, property) {
    var scaleValue = vde.ui.inspector.getProperty.call(this, property).split(':');
    this.primitive[scale] = {'data': scaleValue[0], 'field': scaleValue[1] };
    this.primitive.update();
}

vde.ui.inspector.close = function() {
    d3.select('body').append('div')
        .attr('id', this.el.attr('id'))
        .html(this.el.html())
        .style('display', 'none');

    this.el.remove();
};