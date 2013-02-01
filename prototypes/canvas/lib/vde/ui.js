vde.ui = {
    panels: []
};

vde.ui.init = function() {
    // Load a default panel if we've not imported others
    if(this.panels.length == 0)  
        this.panels.push(new this.panel(this.panels.length));

    // Load the various inspectors into their own divs
    Object.keys(vde.primitives).forEach(function(type) {
        d3.xhr('lib/vde/primitives/' + type + '/inspector.html', function(error, response) {
            d3.select('body').append('div')
                .attr('id', 'inspector_' + type)
                .style('display', 'none')
                .html(response.responseText);
        });
    });
};