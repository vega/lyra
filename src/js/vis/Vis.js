vde.Vis = (function() {
  var vis = {
    properties: {
      width: 400,
      height: 300,
      padding: {top:30, left:30, right:30, bottom:30}
    },

    _data:   {},
    pipelines: {},
    groups: {},

    view: null
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
        format: vg.isString(type) ? {type: type} : type
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

    for(var d in vis._data) {
      var dd = vg.duplicate(vis._data[d]);
      if(dd.url)        // Inline values to deal with x-site restrictions
        delete dd.values;

      spec.data.push(dd);
    };

    // Scales are defined within groups. No global scales.
    for(var p in vis.pipelines) spec.data = spec.data.concat(vis.pipelines[p].spec());

    for(var g in vis.groups) spec.marks.push(vis.groups[g].spec());

    vde.Vis.Callback.run('vis.post_spec', this, {spec: spec});

    vg.parse.spec(spec, function(chart) {
      d3.select('#vis').selectAll('*').remove();
      (vde.Vis.view = chart({ el: '#vis' })).update();
      
      for(var g in vis.groups) vis.groups[g].annotateDef();
    });

    return spec;
  };

  return vis;
})();