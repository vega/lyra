vde.Vis = (function() {
  var vis = {
    properties: {
      width: 400,
      height: 300,
      padding: {top:20, left:20, right:20, bottom:20}
    },

    _data:   {},
    pipelines: {},
    groups: {}
  };

  vis.data = function(name, data, type) {
    if(!data) return vis._data[name];

    if(vg.isObject(data)) {
      vis._data[name] = {
        name: name,
        values: data
      };
    }

    if(vg.isString(data)) {
      vis._data[name] = {
        name: name,
        url: data,
        type: type
      };

      d3[type](data, function(error, response) {
        vis._data[name].values = response;
      });   
    }     
  };

  vis.parse = function() {
    var spec = {
      width: vis.properties.width,
      height: vis.properties.height,
      padding: vis.properties.padding,
      data: [],
      scales: [],
      marks: []
    };

    vde.Vis.Callback.run('vis.pre_spec', this, {spec: spec});

    vg.keys(vis._data).forEach(function(d) {
      var dd = vg.duplicate(vis._data[d]);
      if(dd.url)
        delete dd.values;

      spec.data.push(dd);
    });

    vg.keys(vis.pipelines).forEach(function(k) { 
      var p = vis.pipelines[k];

      spec.data.push(p.spec());
      vg.keys(p.scales).forEach(function(s) {
        spec.scales.push(p.scales[s].spec());
      });
    });
    
    vg.keys(vis.groups).forEach(function(k) { spec.marks.push(vis.groups[k].spec()); });

    vde.Vis.Callback.run('vis.post_spec', this, {spec: spec});

    vg.parse.spec(spec, function(chart) {
      d3.select('#vis').selectAll('*').remove();
      (vis.view = chart({ el: '#vis' })).update();
    });

    return spec;
  };

  return vis;
})();