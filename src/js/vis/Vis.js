vde.Vis = (function() {
  var vis = {
    properties: {
      width: 500,
      height: 375,
      _autopad: true,
      // padding: {top:30, left:40, right:30, bottom:40}
    },

    _data:   {},
    pipelines: {},
    groups: {},

    view: null,
    evtHandlers: {}
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

  vis.addEventListener = function(type, handler) {
    vis.evtHandlers[type] || (vis.evtHandlers[type] = []);
    vis.evtHandlers[type].push(handler);
  };

  vis.parse = function(inlinedValues) {
    var props = vis.properties;
    var spec = {
      width: props.width,
      height: props.height,
      padding: props._autopad ? 'auto' : props.padding,
      data: [],
      scales: [],
      marks: []
    };

    vde.Vis.callback.run('vis.pre_spec', this, {spec: spec});

    inlinedValues = (inlinedValues == null || inlinedValues == true);
    for(var d in vis._data) {
      var dd = vg.duplicate(vis._data[d]);
      if(dd.url)        // Inline values to deal with x-site restrictions
        delete dd[inlinedValues ? 'url' : 'values'];

      spec.data.push(dd);
    };

    // Scales are defined within groups. No global scales.
    for(var p in vis.pipelines) spec.data = spec.data.concat(vis.pipelines[p].spec());

    for(var g in vis.groups) spec.marks.push(vis.groups[g].spec());

    vde.Vis.callback.run('vis.post_spec', this, {spec: spec});

    vg.parse.spec(spec, function(chart) {
      d3.select('#vis').selectAll('*').remove();
      (vde.Vis.view = chart({ el: '#vis' })).update();

      for(var g in vis.groups) vis.groups[g].annotate();

      for(var type in vis.evtHandlers)
        vis.evtHandlers[type].forEach(function(h) {
          if(type.indexOf('key') != -1) d3.select('body').on(type, h);
          else vde.Vis.view.on(type, h);
        });

      vde.Vis.view
        .on('mousedown', function(e, i) {
          if(!vde.iVis.dragging) vde.iVis.dragging = {item: i, prev: [e.pageX, e.pageY]};
        })
        .on('mouseup', function() { vde.iVis.dragging = null; })
        .on('mouseover', function(e, i) {
          var d = vde.iVis.dragging, m = i.mark.def.vdeMdl;
          if(!d || !$(d).html() || !m) return;
          if(m.type == 'group') return;

          vde.iVis.timeout = window.setTimeout(function() {
            vde.iVis.activeMark = m;
            vde.iVis.activeItem = i.vdeKey || i.key;

            if($(d).hasClass('mark')) m.connectionTargets();
            else m.propertyTargets();
          }, 750);
        })
        .on('mouseout', function() { window.clearTimeout(vde.iVis.timeout); });

      d3.select('#vis canvas').on('mouseup.vis', function() {
        if(!vde.iVis.dragging || !vde.iVis.newMark) return;
        vde.iVis.addMark();
      });

      // If the vis gets reparsed, reparse the interactive layer too to update any
      // visible handlers, etc.
      vde.iVis.parse();
    });

    return spec;
  };

  vis.export = function() {
    var ex = {
      groups: {},
      pipelines: vg.duplicate(vis.pipelines)
    };

    for(var g in vis.groups) ex.groups[g] = vg.duplicate(vis.groups[g].export());
    return ex;
  }

  return vis;
})();
