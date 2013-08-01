vde.Vis = (function() {
  var vis = {
    properties: {
      width: 400,
      height: 300,
      padding: {top:30, left:30, right:30, bottom:30}
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
        format: {type: type}
      };

      var dataModel = vg.parse.data([vis._data[name]], function() {
        vis._data[name].values = dataModel.load[name];
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

      spec.data = spec.data.concat(p.spec());
      // Scales are defined within groups. No global scales.
      // vg.keys(p.scales).forEach(function(s) {
      //   spec.scales.push(p.scales[s].spec());
      // });
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