var vde = {version: '0.0.4'};

vde.primitives = {marks:{}};
vde.data    = {};
vde.scales  = {};
vde.groups  = {};

vde.view    = null;

vde.init = function() {
    vde.loadData('dummy', [{"a":0,"b":1,"k":0,"s":0,"c":"A"},{"a":1,"b":2,"k":1,"s":0,"c":"B"},{"a":2,"b":3,"k":2,"s":0,"c":"C"},{"a":3,"b":4,"k":3,"s":0,"c":"D"},{"a":4,"b":10,"k":4,"s":0,"c":"A"},{"a":5,"b":7,"k":5,"s":0,"c":"B"},{"a":6,"b":8,"k":6,"s":0,"c":"C"},{"a":7,"b":0,"k":7,"s":0,"c":"D"}]);
    vde.loadData('olympics', 'data/olympics.json');

    vde.ui.init();
};

vde.loadData = function(name, data) {
    if(vg.isObject(data)) {
        vde.data[name] = {
            name: name,
            values: data
        };

        vde.ui.addDataToolbar(name);
    }

    if(vg.isString(data)) {
        d3.json(data, function(error, response) {
            vde.data[name] = {
                name: name,
                url: data,
                values: response
            };

            vde.ui.addDataToolbar(name);
        });   
    }     
}

vde.parse = function() {
    var spec = {
        width:  parseInt(d3.select('#vis').style('width')),
        height: parseInt(d3.select('#vis').style('height')),
        data:   [],
        scales: [],
        marks:  []
    };

    Object.keys(vde.data).forEach(function(d) {
        var dd = vg.duplicate(d);
        if(dd.url)
            delete dd.values;

        spec.data.push(dd);
    });

    vg.parse.spec(spec, vde.ui.render);
}

document.addEventListener('DOMContentLoaded', function() {
    vde.init();
}); 