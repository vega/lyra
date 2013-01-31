var vde = {
    version: '0.0.1',
    libs: ['spec'],
    primitives: {
        scale: {},
        rect: {}
    },
    data: []
};

vde.init = function() {
    // vde.loadLibs();
    this.loadTemplate('bin/vgd3.js.template');
    this.loadData('data/olympics.json');
    this.ui.init();
}

vde.loadLibs = function() {
    var head = d3.select('head');
    vde.libs.forEach(function(lib) {
        head.append('script').attr('src', 'lib/vde/'+lib+'.js');
    });
}

vde.loadTemplate = function(uri) {
    d3.xhr(uri, function(error, response) {
        vde.template = response.responseText;
    });
}

vde.loadData = function(uri) {
    // Dummy data ("table") from Vega examples
    this.data.push([{"a":0,"b":1,"k":0,"s":0,"c":"A"},{"a":1,"b":2,"k":1,"s":0,"c":"B"},{"a":2,"b":3,"k":2,"s":0,"c":"C"},{"a":3,"b":4,"k":3,"s":0,"c":"D"},{"a":4,"b":10,"k":4,"s":0,"c":"A"},{"a":5,"b":7,"k":5,"s":0,"c":"B"},{"a":6,"b":8,"k":6,"s":0,"c":"C"},{"a":7,"b":0,"k":7,"s":0,"c":"D"}]);

    d3.json(uri, function(error, response) {
        vde.data.push(response);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    vde.init.call(vde);
}); 