var vde = {
    version: '0.0.1',
    libs: ['spec', 'primitive', 'ui', 'ui.panel', 'ui.inspector', 'ui.pill'],
    primitives: {
        scale: {inspector: false},
        rect: {inspector: true},
        axis: {inspector: false}
    },
    data: {},
    loaded: 0
};

vde.init = function() {
    var toLoad = vde.loadLibs();
    this.loadTemplate('bin/vgd3.js.template');
    this.loadData();

    var loadUi = window.setInterval(function() {
        if(toLoad == vde.loaded) {
            window.clearInterval(loadUi);
            vde.ui.init();
        }
    }, 250);
}

vde.loadLibs = function() {
    var toLoad = 0;
    var head = d3.select('head');

    vde.libs.forEach(function(lib) {
        head.append('script')
            .attr('src', 'lib/vde/'+lib.replace('.', '/')+'.js')
            .on('load', function() { vde.loaded++ });
        ++toLoad;
    });

    Object.keys(vde.primitives).forEach(function(type) {
        head.append('script')
            .attr('src', 'lib/vde/primitives/'+type+'/'+type+'.js')
            .on('load', function() { vde.loaded++ });
        ++toLoad;

        if(vde.primitives[type].inspector) {
            head.append('script')
                .attr('src', 'lib/vde/primitives/'+type+'/inspector.js')
                .on('load', function() { vde.loaded++ });

            head.append('link')
                .attr('rel', 'stylesheet')
                .attr('href', 'lib/vde/primitives/'+type+'/inspector.css')
                .on('load', function() { vde.loaded++ });

            toLoad += 2;
        }
    });

    return toLoad;
}

vde.loadTemplate = function(uri) {
    d3.xhr(uri, function(error, response) {
        vde.template = response.responseText;
    });
}

vde.loadData = function() {
    // Dummy data ("table") from Vega examples
    this.data.dummy = [{"a":0,"b":1,"k":0,"s":0,"c":"A"},{"a":1,"b":2,"k":1,"s":0,"c":"B"},{"a":2,"b":3,"k":2,"s":0,"c":"C"},{"a":3,"b":4,"k":3,"s":0,"c":"D"},{"a":4,"b":10,"k":4,"s":0,"c":"A"},{"a":5,"b":7,"k":5,"s":0,"c":"B"},{"a":6,"b":8,"k":6,"s":0,"c":"C"},{"a":7,"b":0,"k":7,"s":0,"c":"D"}];

    d3.json('data/olympics.json', function(error, response) {
        vde.data.olympics = response;
    });
}

document.addEventListener('DOMContentLoaded', function() {
    vde.init.call(vde);
}); 