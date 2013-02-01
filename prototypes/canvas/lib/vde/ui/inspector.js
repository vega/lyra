vde.ui.inspector = {};

vde.ui.inspector.populateFields = function(property, allowDummy, allowCustom) {
    var menu = this.el.select('.' + property)
        .select('select');

    menu.html('');

    if(allowDummy)
        menu.append('option')
            .attr('value', 'dummy')
            .text('Dummy Data');

    if(allowCustom)
        menu.append('option')
            .attr('value', 'custom')
            .text('Custom')

    Object.keys(vde.data).forEach(function(k, i) {
        if(i == 0)  // Dummy
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
    return this.el.select('.' + property).select('input').property('value');
};

vde.ui.inspector.updateProperty = function(property) {
    this.primitive[property] = vde.ui.inspector.getProperty.call(this, property);
    this.primitive.update();
};

vde.ui.inspector.close = function() {
    d3.select('body').append('div')
        .attr('id', this.el.attr('id'))
        .html(this.el.html())
        .style('display', 'none');

    this.el.remove();
};