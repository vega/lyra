vde.Vis = (function() {
  var vis = {

    properties: {
      width: 500,
      height: 375,
      _autopad: true,
      padding: {top:30, left:30, right:30, bottom:30} //default values when _autopad is disabled 
    },

    _data:   {},
    pipelines: {},
    groups: {},
    groupOrder: [],

    view: null,
    evtHandlers: {}
  };

  vis.data = function(name, data, type) {
    var deferred = vde.iVis.ngQ().defer();
    if(!data) return vis._data[name];

    if(vg.isObject(data)) {
      vis._data[name] = {
        name: name,
        values: data,
        format: {}
      };
      deferred.resolve(vis._data[name]);
    }

    if(vg.isString(data)) {
      vis._data[name] = {
        name: name,
        url: data,
        format: vg.isString(type) ? {type: type} : type
      };

      var dataModel = vg.parse.data([vis._data[name]], function() {
        vis._data[name].values = dataModel.load[name];
        deferred.resolve(vis._data[name]);
      });
    }

    return deferred.promise;
  };

  vis.addEventListener = function(type, caller, handler) {
    if(!vis.evtHandlers[type]) vis.evtHandlers[type] = [];
    vis.evtHandlers[type].push({
      caller: caller,
      handler: handler
    });
  };

  vis.removeEventListener = function(type, caller) {
    var del = [], regd = (vis.evtHandlers[type] || []);
    regd.forEach(function(r, i) {
      if(r.caller == caller) del.push(i);
    });

    del.forEach(function(d) { regd.splice(d, 1); });
  };

  vis.spec = function(inlinedValues) {
    var props = vis.properties, rawSources = {};
    inlinedValues = (inlinedValues === null || inlinedValues === undefined || 
      inlinedValues === true);

    var addRawSource = function(src) {
      if(!src || rawSources[src]) return;

      var data = vg.duplicate(vis._data[src]);
      // If we're inlining the data values, we don't want vega to load + format
      // from URL.
      if(inlinedValues) { 
        delete data.url;
        delete data.format;
      } else {
        delete data.values;
      }

      // Inline values to deal with x-site restrictions
      if(data.url) delete data[inlinedValues ? 'url' : 'values'];

      data["lyra.role"] = 'data_source';
      spec.data.push(data);
      rawSources[src] = 1;
    };

    var spec = {
      width: props.width,
      height: props.height,
      padding: props._autopad ? 'auto' : props.padding,
      data: [],
      scales: [],
      marks: []
    };

    vde.Vis.callback.run('vis.pre_spec', this, {spec: spec}); 

    // Scales are defined within groups. No global scales.
    for(var p in vis.pipelines) {
      var pl = vis.pipelines[p];
      // Clear scales hasAxis flag.
      for(var s in pl.scales) {
        pl.scales[s].hasAxis = false;
        pl.scales[s].used = false;
      }

      addRawSource(pl.source);
      spec.data = spec.data.concat(pl.spec());
    }

    // Reverse order of groups: earlier in groupOrder => closer to front
    vis.groupOrder.forEach(function(g) { spec.marks.unshift(vis.groups[g].spec()); });

    vde.Vis.callback.run('vis.post_spec', this, {spec: spec});

    // Now that the spec has been generated, bookkeep to clean up unused scales
    for(var p in vis.pipelines) vis.pipelines[p].bookkeep();
    for(var g in vis.groups) vis.groups[g].bookkeep();

    return spec;
  };

  vis.render = function(inlinedValues) {
    var deferred = vde.iVis.ngQ().defer(),
        spec = vis.spec(inlinedValues);

    vg.parse.spec(spec, function(chart) {
      d3.select('#vis').selectAll('*').remove();
      (vde.Vis.view = chart({ el: '#vis' })).update();

      for(var g in vis.groups) vis.groups[g].annotate();

      for(var type in vis.evtHandlers)
        vis.evtHandlers[type].forEach(function(h, i) {
          if(type.indexOf('key') != -1) d3.select('body').on(type + '.' + i, h.handler);
          else vde.Vis.view.on(type, h.handler);
        });

      var newMark = function() {
        if(!vde.iVis.dragging || !vde.iVis.newMark) return;
        vde.iVis.addMark();
      };

      vde.Vis.view
        .on('mousedown', function(e, i) {
          if(!vde.iVis.dragging) vde.iVis.dragging = {item: i, prev: [e.pageX, e.pageY]};
        })
        .on('mouseup', function() { newMark(); vde.iVis.dragging = null; })
        .on('mouseover', function(e, i) {
          var d = vde.iVis.dragging, m = i.mark.def.vdeMdl;
          if(!d || !$(d).html() || !m) return;
          if(m == vde.iVis.activeMark && vde.iVis.activeItem == i.vdeKey) return;
          if(m.type == 'group') return;

          vde.iVis.markTimeout = window.setTimeout(function() {
            var scope = vde.iVis.ngScope();
            scope.$apply(function() { scope.toggleVisual(m, i.vdeKey || i.key || 0, true); });

            var isMark = $(d).hasClass('mark');
            if(isMark && vde.iVis.newMark.canConnect) m.connectionTargets();
            else if(!isMark) m.propertyTargets();
          }, vde.iVis.timeout);
        })
        .on('mouseout', function() { window.clearTimeout(vde.iVis.markTimeout); });

      d3.select('#vis canvas').on('mouseup.vis', newMark);

      // If the vis gets reparsed, reparse the interactive layer too to update any
      // visible handlers, etc.
      vde.iVis.render().then(function() { deferred.resolve(spec); });
    });

    return deferred.promise;
  };

  vis.export = function(data) {
    var ex = {
      groups: {},
      groupOrder: vg.duplicate(vis.groupOrder),
      pipelines: vg.duplicate(vis.pipelines),
      properties: vg.duplicate(vis.properties),
    };

    // Only store used raw data
    if(data) {
      ex._data = {};
      for(var p in vis.pipelines) {
        var src = vis.pipelines[p].source;
        if(!src) continue;
        ex._data[src] = vg.duplicate(vis._data[src]);
      }
    }

    for(var g in vis.groups) ex.groups[g] = vg.duplicate(vis.groups[g].export());
    return ex;
  };

  vis.import = function(spec) {
    var scales = {}, deferred = vde.iVis.ngQ().defer();

    var className = function(n) {
      return n.charAt(0).toUpperCase() + n.slice(1);
    };

    var importProperties = function(a, b) {
      for(var k in b) {
        if(vg.isObject(b[k])) {
          if(!vg.isObject(a[k])) {
            if(b[k].hasOwnProperty('accessor') || k == 'field') a[k] = new vde.Vis.Field('');
            else if(k == 'scale' || b[k].hasOwnProperty('domainTypes')) a[k] = scales[b[k].name];
            else if(vg.isArray(b[k])) a[k] = [];
            else a[k] = {};
          }
          importProperties(a[k], b[k]);
        } else {
          a[k] = b[k];
        }
      }
    };

    var importGroups = function(g) {
      var group = new vde.Vis.marks.Group(g.name, g.layerName, g.groupName);
      group.import(g);

      for(var scaleName in g.scales) {
        group.scales[scaleName] = scales[scaleName];
      }

      for(var axisName in g.axes) {
        var a = g.axes[axisName];
        var axis = new vde.Vis.Axis(axisName, a.layerName, a.groupName);
        axis.init();
        axis.import(a);
      }

      for(var markName in g.marks) {
        var m = g.marks[markName];
        if(m.type == 'group') importGroups(m);
        else {
          var mark = new vde.Vis.marks[className(m.type)](markName, m.layerName, m.groupName);
          mark.init();
          mark.import(m);
        }
      }

      importProperties(group, g);
    };

    vis.reset();

    for(var pipelineName in spec.pipelines) {
      var p = spec.pipelines[pipelineName];
      var pipeline = new vde.Vis.Pipeline(pipelineName, p.source);

      for(var scaleName in p.scales) {
        var scale = new vde.Vis.Scale(scaleName, pipeline, {});
        scales[scaleName] = scale; // Keep around for groups
      }

      p.transforms.forEach(function(t) {
        var transform = new vde.Vis.transforms[className(t.type)](pipelineName);
        pipeline.transforms.push(transform);
      });

      importProperties(pipeline, p);
    }

    for(var layerName in spec.groups) {
      importGroups(spec.groups[layerName]);
    }

    importProperties(vis.properties, spec.properties);
    if(spec._data) importProperties(vis._data, spec._data);
    importProperties(vis.groupOrder, spec.groupOrder);

    vis.render().then(function(spec) { deferred.resolve(spec); });

    return deferred.promise;
  };

  vis.reset = function() {
    // Clear existing pipelines and groups. We want to do this in two
    // apply cycles because pipeline/group names may be the same, and
    // angular may not pick up the updates otherwise.
    for(var p in vis.pipelines) { delete vis.pipelines[p]; }
    for(var g in vis.groups) { delete vis.groups[g]; }
    for(var c in vis.callback._registered) { delete vis.callback._registered[c]; }
    vde.Vis.groupOrder.length = 0;
    vde.iVis.activeMark = null;
  };

  vis.parseProperty = function(props, prop) {
    var p = props[prop], parsed = {};
    if(!vg.isObject(p)) return;
    if(p.disabled) return;

    for(var k in p) {
      if(p[k] === undefined || p[k] === null) return;

      if(k == 'scale') { parsed[k] = p[k].name; p[k].used = true; }
      else if(k == 'field') parsed[k] = p[k].spec();
      else {
        var value = (!isNaN(+p[k])) ? +p[k] : p[k];
        if(value == 'auto') {   // If the value is auto, rangeband
          if(p.scale.type() == 'ordinal') {
            parsed.band = true;
            parsed.offset = -1;
          } else parsed[k] = 0; // If we don't have an ordinal scale, just set value:0
        } else {
          parsed[k] = value;
        }
      }
    }

    return parsed;
  };

  vis.codename = function(count) {
    return count+1;
  };

  return vis;
})();

/**
 * Interactive Layer of vde.  All handlers, dropzones, etc.
 * are drawn on this layer.
 */

vde.iVis = (function() {
  var ivis = {
    view: null,
    dragging: null,

    timeout: 750,
    markTimeout: null,
    dropzoneTimeout: null,

    _data: {}, _marks: [], _evtHandlers: {},
    newMark: null,
    activeMark: null,
    activeItem: null
  };

  var events = [
    "mousemove", "mousedown", "mouseup", "mouseover", "mouseout",
    "click", "dblclick", "keypress", "keydown", "keyup"
  ];

  var interactors = ['handle', 'connector', 'connection', 'point', 'span', 'dropzone', 'pie'];

  ivis.interactor = function(interactor, data) {
    if(!interactor || !data) return;

    this._data[interactor] = data;
    return this;
  };

  ivis.show = function(show, evtHandlers) {
    if(!vg.isArray(show)) show = [show];
    if(show == 'selected' && this.activeMark) {
      var selected = this.activeMark.selected();
      show = vg.keys(selected.interactors);
      for(var s in selected.interactors) ivis.interactor(s, selected.interactors[s]);
      if(!evtHandlers) evtHandlers = selected.evtHandlers;
    }

    var d = {};
    interactors.forEach(function(i) { d[i] = []; });
    show.forEach(function(s) { if(ivis._data[s]) d[s] = ivis._data[s]; });

    // Unregister all evtHandlers and re-register them here
    if(evtHandlers) {
      this._evtHandlers = {};
      for(var type in evtHandlers) this._evtHandlers[type] = evtHandlers[type];
    }

    ivis.view.data(d).update();

    return this;
  };

  // We can't keep re-parsing the iVis layer. This triggers false mouseout
  // events as a result of removing all #ivis children. So, we only reparse
  // when we reparse the Vis, and subsequently only update the datasets.
  ivis.render = function(scale) {
    var deferred = ivis.ngQ().defer();
    var spec = {
      width: vde.Vis.view._width,
      height: vde.Vis.view._height,
      padding: vde.Vis.view._padding
    };

    spec.data = interactors.map(function(i) { return {name: i, values: [] }; });
    spec.scales = [{
      name: 'size',
      type: 'quantize',
      domain: [0, 1],
      range: [40, 20]
    },
    {
      name: 'disabled',
      type: 'quantize',
      domain: [0, 1],
      range: ['#fff', '#999']
    }, {
      name: 'connection_status',
      type: 'quantize',
      domain: [0, 1],
      range: ['magenta', 'lime']
    }];
    spec.marks = interactors.map(function(i) { return ivis[i](); });

    // If we're visualizing a scale, augment our spec
    if(scale) ivis.scale(scale, spec);

    vg.parse.spec(spec, function(chart) {
      d3.select('#ivis').selectAll('*').remove();
      (vde.iVis.view = chart({ el: '#ivis' })).update();

      var icanvas = d3.select('#ivis canvas');

      // We have event handlers registered on both #vis and #ivis
      // so transmit interactions on ivis (on top) to #vis (bottom).
      var dispatchEvent = function() {
        var e = d3.event;
        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent(e.type, e.canBubble, e.cancelable, window,
          e.detail, e.screenX, e.screenY, e.clientX, e.clientY,
          e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.button, e.relatedTarget);
        d3.select('#vis canvas').node().dispatchEvent(evt);
      };

      var mouseup = function() { vde.iVis.dragging = null; icanvas.style('cursor', 'auto'); };

      events.forEach(function(type) {
        if(type == 'mousemove') {
          icanvas.on('mousemove', function() {
            dispatchEvent();
            if(ivis._evtHandlers[type]) ivis._evtHandlers[type]();
          });
        } else if(type.indexOf('key') != -1) {
          d3.select('body').on(type, function() {
            if(ivis._evtHandlers[type]) ivis._evtHandlers[type]();
          });
        } else {
          icanvas.on(type, function() {
            dispatchEvent();
            if(type == 'mouseup') {
              if(ivis._evtHandlers[type]) ivis._evtHandlers[type]();
              mouseup();
            }
          });

          vde.iVis.view.on(type, function(e, item) {
            if(type != 'mouseup' && ivis._evtHandlers[type])
              ivis._evtHandlers[type](e, item);

            var cursor = function() {
              if(item.mark.def.name == 'handle' && item.datum.data &&
                  item.datum.data.cursor && !item.datum.data.disabled)
                icanvas.style('cursor', item.datum.data.cursor);
            };

            var items = function() { 
              var items = [];

              if(item.connector) {  // Point or Connector
                if(item.mark.group.items[1].items.length > 0)   // Connectors
                  items.push(item.mark.group.items[1].items[item.key]);

                if(item.mark.group.items[3].items.length > 0) { // Points
                  // We need to offset by the number of spans
                  item.mark.group.items[3].items.forEach(function(i) {
                    if(i.connector == item.connector || 
                       i.connector == item.property) items.push(i);
                  });
                }
              } else { // Span
                // Iterate over span groups
                item.mark.group.items[4].items.forEach(function(spanGroup) {
                  spanGroup.items[0].items.forEach(function(lineSegment) {
                    if(lineSegment.span.indexOf(item.property + '_') != -1) 
                      items.push(lineSegment);
                  });
                });
              }

              return items;
            };

            // Automatically register events to handle dragging
            switch(type) {
              case 'mouseover':
                cursor();

                if(ivis.dragging && item.mark.def.name == 'dropzone') {
                  // On mouseover, highlight the underlying span/connector.
                  ivis.view.update({ props: 'hover', items: items() });

                  if(item.property) {
                    d3.selectAll('#' + item.property + '.property').classed('drophover', true);
                    ivis.tooltip(e, item, item.hint, item.property);
                  }
                }
              break;

              case 'mouseout':
                if(ivis.dragging && item.mark.def.name == 'dropzone') {
                  // Clear highlights
                  ivis.view.update({ props: 'update', items: items() });

                  if(item.property)
                    d3.selectAll('#' + item.property + '.property').classed('drophover', false);
                  $('.tooltip').remove();
                }

                if(!ivis.dragging) mouseup();
              break;

              case 'mousedown':
                ivis.dragging = {item: item, prev: [e.pageX, e.pageY]};
                cursor();
              break;

              case 'mouseup':
                if(ivis.dragging && item.mark.def.name == 'dropzone') {
                  var isMark = $(ivis.dragging).hasClass('mark');
                  if(item.property && !isMark) {
                    ivis.bindProperty(ivis.activeMark, item.property, true);
                    d3.selectAll('#' + item.property + '.property').classed('drophover', false);
                  } else if(item.connector && isMark) {
                    ivis.addMark(ivis.activeMark, item.connector);
                  }
                }
              break;
            }
          });
        }
      });

      if(!scale) ivis.show('selected');

      deferred.resolve(spec);
    });

    return deferred.promise;
  };

  ivis.bindProperty = function(visual, property, defaults) {
    if(!ivis.dragging) return;

    var rootScope = ivis.ngScope();
    var field = $(ivis.dragging).data('field') || $(ivis.dragging).find('.schema').data('field');
    var scale = $(ivis.dragging).find('.scale').attr('scale');
    var pipelineName = rootScope.activePipeline.name;

    rootScope.$apply(function() {
      if(visual && !visual.pipelineName && !(visual instanceof vde.Vis.Transform)) visual.pipelineName = pipelineName;

      // If we don't have an activeMark, we're dropping over the layer's facet dropzones
      (visual || rootScope.activeLayer).bindProperty(property,
        {field: field, scaleName: scale, pipelineName: pipelineName}, defaults);
    });

    vde.Vis.render().then(function() {
      $('.proxy, .tooltip').remove();
      ivis.dragging = null;

      if(!visual) visual = {};
      if(visual.layerName) rootScope.toggleVisual(visual, null, true);
      ivis.ngTimeline().save();
    });

    window.clearTimeout(vde.iVis.timeout);
  };

  ivis.addMark = function(host, connector) {
    var mark = ivis.newMark,
        rootScope = ivis.ngScope();

    // Mouseup evt will propagate down to Vis and we want to clear this so we
    // don't double add a mark.
    ivis.newMark = null;

    // If they've dropped on an empty non-group space.
    if(!host) {
      host = rootScope.activeLayer || (new vde.Vis.marks.Group());
    }

    if(host instanceof vde.Vis.marks.Group) mark.layerName = host.name;
    else if(host.connectors[connector] && mark.canConnect) {
      mark.layerName    = host.layerName;
      mark.connectedTo  = {host: host, connector: connector};
    }

    mark.pipelineName = (rootScope.activePipeline||{}).name;

    rootScope.$apply(function() {
      mark.init();
      vde.Vis.render().then(function() {
        rootScope.toggleVisual(mark, null, true);
        ivis.ngTimeline().save();

        $('.proxy').remove();
      });
    });

    window.clearTimeout(vde.iVis.timeout);
  };

  ivis.handle = function() {
    return {
      name: 'handle',
      type: 'symbol',
      from: {data: 'handle'},
      properties: {
        enter: {
          shape: {value: 'square'},
          stroke: {value: 'black'},
          strokeWidth: {value: 0.5}
        },
        update: {
          x: {field: 'data.x'},
          y: {field: 'data.y'},
          size: {scale: 'size', field: 'data.small'},
          fill: {scale: 'disabled', field: 'data.disabled'},
          connector: {field: 'data.connector'}
        }
      }
    };
  };

  ivis.connector = function() {
    return {
      name: 'connector',
      type: 'symbol',
      from: {
        data: 'connector',
        transform: [{
          type: 'formula',
          field: 'status',
          expr: '(d.data.connected) ? 1 : 0'
        }]
      },
      properties: {
        enter: {
          shape: {value: 'diamond'},
          fill: {value: 'white'}
        },
        update: {
          x: {field: 'data.x'},
          y: {field: 'data.y'},
          size: {scale: 'size', field: 'data.small'},
          stroke: {scale: 'connection_status', field: 'status'},
          strokeWidth: {value: 0.5},
          connector: {field: 'data.connector'}
        },
        hover: {
          stroke: {value: 'lime'},
          strokeWidth: {value: 1}
        }
      }
    };
  };

  ivis.connection = function() {
    return {
      name: 'connection_group',
      type: 'group',
      from: {
        data: 'connection',
        transform: [{type: 'facet', keys:['data.span']}]
      },
      marks: [{
        name: 'connection',
        type: 'line',
        properties: {
          update: {
            x: {field: 'data.x'},
            y: {field: 'data.y'},
            stroke: {value: 'black'},
            strokeWidth: {value: 0.5},
            strokeDash: {value: [5, 5]}
          }
        }
      }]
    };
  };

  ivis.point = function() {
    return {
      name: 'point',
      type: 'symbol',
      from: {data: 'point'},
      properties: {
        enter: {
          shape: {value: 'circle'}
        },
        update: {
          x: {field: 'data.x'},
          y: {field: 'data.y'},
          fill: {value: 'cyan'},
          size: {scale: 'size', field: 'data.small'},
          connector: {field: 'data.connector'}
        },
        hover: {
          size: {value: 80},
          fill: {value: 'lightsalmon'}
        }
      }
    };
  };

  ivis.span = function() {
    return {
      name: 'span_group',
      type: 'group',
      from: {
        data: 'span',
        transform: [{type: 'facet', keys:['data.span']}]
      },
      marks: [{
        name: 'span',
        type: 'line',
        properties: {
          update: {
            x: {field: 'data.x'},
            y: {field: 'data.y'},
            stroke: {value: 'cyan'},
            strokeWidth: {value: 2},
            span: {field: 'data.span'}
          },
          hover: {
            stroke: {value: 'lightsalmon'},
            strokeWidth: {value: 3}
          }
        }
      }]
    };
  };

  ivis.pie = function() {
    return {
      name: 'dropzone',
      type: 'arc',
      from: {data: 'pie'},
      properties: {
        enter: {
          shape: {value: 'circle'}
        },
        update: {
          x: {field: 'data.x'},
          y: {field: 'data.y'},
          outerRadius: {field: 'data.outerRadius'},
          innerRadius: {field: 'data.outerRadius', offset: -10},
          startAngle: {field: 'data.startAngle'},
          endAngle: {field: 'data.endAngle'},
          fill: {value: 'cyan'},
          stroke: {value: 'cyan'},
          strokeWidth: {value: 10},
          strokeOpacity: {value: 0.1},
          property: {field: 'data.property'},
          connector: {field: 'data.connector'},
          hint: {value: 'Pie Layout'}
        },
        hover: {
          fill: {value: 'lightsalmon'},
          stroke: {value: 'lightsalmon'},
        }
      }
    };
  };

  ivis.dropzone = function() {
    return {
      name: 'dropzone',
      type: 'rect',
      from: {data: 'dropzone'},
      properties: {
        enter: {
          fillOpacity: {value: 0.1}
          // stroke: {value: 'black'},
          // strokeDash: {value: [0.3, 1]}
        },
        update: {
          x: {field: 'data.x'},
          y: {field: 'data.y'},
          x2: {field: 'data.x2'},
          y2: {field: 'data.y2'},
          fill: {value: 'cyan'},
          property: {field: 'data.property'},
          connector: {field: 'data.connector'},
          layout: {field: 'data.layout'},
          hint: {field: 'data.hint'},
        },
        hover: {
          fill: {value: 'lightsalmon'},
        }
      }
    };
  };

  ivis.scale = function(scale, spec) {
    var pipeline = scale.pipeline();
    if(!pipeline || !pipeline.source) return;

    // If this scale is already shown on the vis, we don't need to bother
    if(scale.hasAxis) return;

    // To visualize a scale, we need to pull in the source data and pipeline.
    var raw = vg.duplicate(vde.Vis._data[pipeline.source]);
    delete raw.url;
    spec.data.push(raw);
    spec.data = spec.data.concat(pipeline.spec());
    spec.scales.push(scale.spec());

    var inflector = vde.iVis.ngFilter()('inflector');
    var title = scale.field() ? inflector(scale.field().name) : scale.displayName;

    if(scale.rangeTypes.type == 'spatial') {
      if(!spec.axes) spec.axes = [];
      spec.axes.push({
        type: scale.axisType,
        orient: scale.axisType == 'x' ? 'bottom' : 'left',
        offset: -50,
        scale: scale.name,
        title: title,
        layer: 'front',
        properties: {
          axis: {
            stroke: {value: 'cyan'},
            strokeWidth: {value: 2}
          },
          ticks: {
            stroke: {value: 'cyan'},
            strokeWidth: {value: 2}
          },
          labels: {fill: {value: 'cyan'}},
          title: {fill: {value: 'cyan'}}
        }
      });
    }
  };

  ivis.tooltip = function(evt, dropzone, hint, property) {
    var tooltip = $('<div class="tooltip fade in">' +
      '<div class="tooltip-arrow"></div>' +
      '<div class="tooltip-inner">' + (hint || property) + '</div></div>');
    $('body').append(tooltip);
    var b = ivis.translatedBounds(dropzone, dropzone.bounds);
    var coords;
    if(dropzone.layout == 'horizontal') {
      coords = ivis.translatedCoords({x: b.x2, y: b.y1 + b.height()/2});
      coords.y -= tooltip.height()/2;
      tooltip.addClass('right');
    } else {
      coords = ivis.translatedCoords({x: b.x1 + b.width()/2, y: b.y1});
      coords.x -= tooltip.width()/2;
      coords.y -= tooltip.height();
      tooltip.addClass('top');
    }

    tooltip.css('left', coords.x + 'px').css('top', coords.y + 'px');
  };

  // From vg.canvas.Renderer
  ivis.translatedBounds = function(item, bounds) {
    var b = new vg.Bounds(bounds);
    while ((item = item.mark.group) !== null && item !== undefined) {
      b.translate(item.x || 0, item.y || 0);
    }
    return b;
  };

  // Translate vega coordinates into global
  ivis.translatedCoords = function(coords) {
    var canvas = $('#ivis canvas').offset();

    return {
      x: coords.x + canvas.left + vde.Vis.view._padding.left,
      y: coords.y + canvas.top + vde.Vis.view._padding.top
    };
  };

  ivis.ngScope = function() {
    return $('html').injector().get('$rootScope');
  };

  ivis.ngTimeline = function() {
    return $('html').injector().get('timeline');
  };

  ivis.ngFilter = function() {
    return $('html').injector().get('$filter');
  };

  ivis.ngQ = function() {
    return $('html').injector().get('$q');
  };

  ivis.ngCompile = function() {
    return $('html').injector().get('$compile');
  };

  return ivis;
})();

vde.Vis.Mark = (function() {
  var mark = function(name, layerName, groupName) {
    this.name = name;
    this.displayName = name;

    this.layerName    = layerName;
    this.groupName    = groupName;
    this.pipelineName = null;
    this.oncePerFork  = false;

    this._spec = {
      properties: {
        enter:  {}
        // update: {},
        // hover:  {}
      }
    };

    this.extents = {};

    this._def   = null;
    this._items = [];

    this.canConnect = false;
    this.connectors = {};
    this.connectedTo = {};

    return this;
  };

  var prototype = mark.prototype;
  var geomOffset = 7;

  var capitaliseFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  prototype.init = function() {
    var self = this;

    if(!this.layerName) {
      var g = new vde.Vis.marks.Group();
      this.layerName = g.name;
    }

    if(!this.name)
      this.name = this.type + '_' + Date.now();

    if(!this.displayName) {
      var count = this.group()._markCount++;
      if(!this.group().isLayer()) count = this.group().group()._markCount++;
      this.displayName = capitaliseFirstLetter(this.type) + ' ' + vde.Vis.codename(count);
    }

    if(this.group() != this) {
      this.group().marks[this.name] = this;
      this.group().markOrder.unshift(this.name);
    }

    vg.keys(this.connectors).forEach(function(c) {
      self.connectors[c] = {
        coords:  function(item, def) { return self.coordinates(c, item, def); },
        connect: function(mark) { return self.connect(c, mark); }
      };
    });

    vde.Vis.addEventListener('click', this, function(e, item) {
      if(item.mark.def != self.def()) return;
      if(item.items && self.type != 'group') return;

      vde.iVis.ngScope().toggleVisual(self, item.vdeKey || item.key || 0, true);
    });

    // Highlight/unhighlight group
    vde.Vis.addEventListener('mouseover', this, function(e, item) {
      if(!item.mark.def.vdeMdl) return;
      var m = item.mark.def.vdeMdl;
      if(!m.group()) return;

      m.group().items().map(function(i) {
        if(i.strokeWidth !== 0) return;
        i.stroke = '#aaaaaa';
        i.strokeWidth = 1;
        i.strokeDash = [1.5, 3];
        i.vdeStroked = true;
        vde.Vis.view.render();
      });
    });

    vde.Vis.addEventListener('mouseout', this, function(e, item) {
      if(!item.mark.def.vdeMdl) return;
      var m = item.mark.def.vdeMdl;
      if(!m.group()) return;

      m.group().items().map(function(i) {
        if(!i.vdeStroked) return;
        i.strokeWidth = 0;
        delete i.strokeDash;
        delete i.vdeStroked;
        vde.Vis.view.render();
      });
    });

    return this;
  };

  prototype.destroy = function() {
    vde.Vis.removeEventListener('click', this);
    vde.Vis.removeEventListener('mouseover', this);
    vde.Vis.removeEventListener('mouseout', this);
  };

  prototype.pipeline = function() {
    return vde.Vis.pipelines[this.pipelineName];
  };

  prototype.group = function() {
    var layer = vde.Vis.groups[this.layerName];
    return this.groupName ? layer.marks[this.groupName] : layer;
  };

  prototype.property = function(prop) {
    return vde.Vis.parseProperty(this.properties, prop);
  };

  prototype.update = function(props) {
    var self = this, def  = this.def();
    if(!vg.isArray(props)) props = [props];

    var update = props.reduce(function(up, prop) {
      var p = self.property(prop);
      if(p) up[prop] = p;
      return up;
    }, {});

    // if(update[prop].scale) vde.Vis.render();
    // else {
      def.properties.update = vg.parse.properties(this.type, update);
      vde.Vis.view.update();
    // }

    return this;
  };

  prototype.spec = function() {
    var spec = vg.duplicate(this._spec);

    var conn = this.connectedTo;
    if(this.canConnect && conn.host) conn.host.connectors[conn.connector].connect(this);

    vde.Vis.callback.run('mark.pre_spec', this, {spec: spec});

    spec.name = this.name;
    if(!spec.type) spec.type = this.type;
    if(!spec.from) spec.from = {};

    if(this.pipeline()) {
       if(!spec.from.data) spec.from.data = this.pipeline().name;
    }

    var enter = spec.properties.enter;
    for(var prop in this.properties)
      enter[prop] = enter[prop] ? enter[prop] : this.property(prop);

    vde.Vis.callback.run('mark.post_spec', this, {spec: spec});

    this._def = null;
    this._items = [];

    spec["lyra.displayName"] = this.displayName;

    return spec.properties ? spec : null;
  };

  prototype.bindProperty = function(prop, opts, defaults) {
    var p = this.properties[prop] || (this.properties[prop] = {});
    var scale, field;

    // bindProperty is always called on the vde.iVis.activeMark (which is usually
    // a specific non-group mark. So we should route the request to the mark's layer
    // if it's a facet dropzones. In case this mark is a group/layer, this should still
    // be ok.
    var facet = vde.Vis.transforms.Facet;
    if(prop == facet.dropzone_horiz || prop == facet.dropzone_vert) {
      var layer = this.group();
      if(!layer.isLayer()) layer = layer.group();

      return layer.bindProperty(prop, opts, defaults);
    }

    if(opts.scaleName) {
      scale = this.pipeline().scales[opts.scaleName];
      if(!scale) scale = vde.Vis.pipelines[opts.pipelineName].scales[opts.scaleName];
      if(scale) this.group().scales[opts.scaleName] = scale;
      p.scale = scale;
    } else if(!defaults && !p.inferred) {
      scale = p.scale;
    }

    if(opts.field) {
      field = new vde.Vis.Field(opts.field);  // Always create a new Field instance
      // if(!(field instanceof vde.Vis.Field)) field = new vde.Vis.Field(field);

      // Run mark specific production rules first so that they get first dibs
      var prules = this.productionRules(prop, scale, field, defaults);
          scale = prules[0];
          field = prules[1];

      if((!scale || p.default) && (field && field.type != 'encoded')) {
        var defaultDef = {}, displayName = null,
            searchDef = {
              domainTypes: {from: 'field'},
              domainField: field,
              rangeTypes: {}
            };

        switch(prop) {
          case 'x':
          case 'x2':
          case 'width':
            searchDef.rangeTypes.type = 'spatial';
            defaultDef = {
              properties: { type: field.type || 'ordinal'},
              rangeTypes: {type: 'spatial', from: 'preset'},
              rangeField: new vde.Vis.Field('width'),
              axisType: 'x'
            };
            displayName = 'X';
          break;

          case 'y':
          case 'y2':
          case 'height':
            searchDef.rangeTypes.type = 'spatial';
            defaultDef = {
              properties: { type: field.type || 'linear'},
              rangeTypes: {type: 'spatial', from: 'preset'},
              rangeField: new vde.Vis.Field('height'),
              axisType: 'y'
            };
            displayName = 'Y';
          break;

          case 'fill':
          case 'stroke':
            searchDef.rangeTypes.type = 'colors';
            defaultDef = {
              properties: { type: 'ordinal'},
              rangeTypes: {type: 'colors', from: 'preset'},
              rangeField: new vde.Vis.Field('category20')
            };
            displayName = capitaliseFirstLetter(prop) + ' Color';
          break;

          case 'fillOpacity':
          case 'strokeWidth':
            searchDef.rangeTypes = {type: 'other', property: prop};
            defaultDef = {
              properties: { type: field.type || 'linear'},
              rangeTypes: {type: 'other', from: 'values', property: prop},
              rangeValues: (prop == 'fillOpacity') ? [0, 1] : [0, 10]
            };
            displayName = capitaliseFirstLetter(prop);
          break;
        }

        if(this.type == 'rect' && defaultDef.properties.type == 'ordinal')
          defaultDef.properties.points = false;

        scale = this.group().scale(this, searchDef, defaultDef, displayName);
      }

      if(scale) p.scale = scale;
      if(field) p.field = field;
      delete p.value;
      delete p.default;
    }

    if(defaults) {
      this.defaults(prop);

      // Add axes by defaults
      var aOpts = {pipelineName: (scale || field || this).pipelineName};

      // We want to be a little smarter about adding axes to groups with layout.
      // Add the axis to the layer instead of the group if the axes orientation
      // matches the group layout.
      var facet = vde.Vis.transforms.Facet;
      if(scale) aOpts.scaleName = scale.name;
      switch(prop) {
        case 'x':
        case 'x2':
        case 'width':
          var existing = this.group().axes.x_axis;
          if(!existing || (existing && existing.default)) {
            var groupName = this.group().layout == facet.layout_horiz ? this.groupName : null;
            var xAxis = new vde.Vis.Axis('x_axis', this.layerName, groupName);
            var ap = xAxis.properties;
            ap.type = 'x'; ap.orient = 'bottom';
            xAxis.bindProperty('scale', aOpts);
            xAxis.default = true;
            xAxis.displayName = capitaliseFirstLetter(scale.displayName) + ' Axis';
          }
        break;

        case 'y':
        case 'y2':
        case 'height':
          var existing = this.group().axes.y_axis;
          if(!existing || (existing && existing.default)) {
            var groupName = this.group().layout == facet.layout_vert ? this.groupName : null;
            var yAxis = new vde.Vis.Axis('y_axis', this.layerName, groupName);
            var ap = yAxis.properties;
            ap.type = 'y'; ap.orient = 'left';
            yAxis.bindProperty('scale', aOpts);
            yAxis.default = true;
            yAxis.displayName = capitaliseFirstLetter(scale.displayName) + ' Axis';
          }
        break;
      }
    }

    this.checkExtents(prop);
  };

  prototype.unbindProperty = function(prop) {
    this.properties[prop] = {value: prop.match('fill|stroke') ? '#000000' : 0};
  };

  prototype.productionRules = function(prop, scale, field) {
    return [scale, field];
  };

  prototype.checkExtents = function(prop) {
    var self = this;

    for(var ext in this.extents) {
      var e = this.extents[ext], p = this.properties[prop];
      if(e.fields.indexOf(prop) == -1) continue;

      var check = e.fields.reduce(function(c, f) { return (self.properties[f] || {}).scale ? c : c.concat([f]); }, []);
      var hist  = e.history || (e.history = []);
      if(hist.indexOf(prop) != -1) hist.splice(hist.indexOf(prop), 1);
      delete p.disabled;

      // If we've hit the limit based on scales, then disable the rest of the fields
      if(e.fields.length - check.length == e.limit)
        check.forEach(function(f) { self.properties[f].disabled = true; });
      else {  // Otherwise, check the history
        var remaining = e.limit - (e.fields.length - check.length);
        if(!p.scale) hist.push(prop);

        if(hist.length > remaining) {
          var pOld = hist.shift();
          if(pOld != prop && check.indexOf(pOld) != -1) this.properties[pOld].disabled = true;
          this.update(pOld);
        }
      }
    }
  };

  prototype.disconnect = function() {
    var conn = this.connectedTo;
    if(conn.host) conn.host.connectors[conn.connector].connect(this);

    this.connectedTo = {};
  };

  prototype.def = function() {
    var self  = this,
        start = this.type == 'group' && this.isLayer() ?
            vde.Vis.view.model().defs().marks : this.group().def();

    if(this._def) return this._def;

    var visit = function(node, name) {
      if(!node.marks) return null;
      if(!name) name = self.name;
      for(var i = 0; i < node.marks.length; i++)
        if(node.marks[i].name == name) return node.marks[i];

      return null;
    };

    var def = visit(start);
    while(!def && this.layerName && this.group() != this) {
      if(!vg.isArray(start)) start = [start];
      if(!start.length) return {};

      // If we haven't found the def in the group, there must be
      // some group injection going on. So look for group marks
      // and look through those.
      var newStart = [];
      for(var i = 0; i < start.length; i++) {
        var marks = start[i].marks;
        if(!marks) continue; 

        for(var j = 0; j < marks.length; j++) {
          var m = marks[j];
          if(m.type == 'group' && (m.name.indexOf(this.layerName) != -1 ||
              m.name.indexOf(this.groupName) != -1))
            newStart.push(m);
        }
      }

      newStart.some(function(s) { if( (def = visit(s)) ) return true; });
      start = newStart;
    }

    def.vdeMdl = this;
    this._def = def;

    return this._def;
  };

  prototype.items = function() {
    var parents = this.type == 'group' && this.isLayer() ?
            [vde.Vis.view.model().scene().items[0]] : this.group().items(),
        def = this.def();

    if(this._items.length > 0) return this._items;

    var visit = function(parent, group) {
      var items = [];
      parent.items.forEach(function(i) {
        if(i.def && (i.def == def || (group && i.marktype == 'group')))
          items = items.concat(i.items);
      });
      return items;
    };

    for(var p = 0; p < parents.length; p++)
      this._items = this._items.concat(visit(parents[p]));

    while(this._items.length === 0) {
      // If we've found no items in the group, there must be
      // group injection going on. So first find those groups
      // and use them as parents
      var groups = [];
      for(var p = 0; p < parents.length; p++)
        groups = groups.concat(visit(parents[p], true));

      for(var g = 0; g < groups.length; g++)
        this._items = this._items.concat(visit(groups[g]));

      parents = groups;
      // If we've recursed all the way up to the root of the tree
      // then this mark probably doesn't have any rendered items.
      if(parents.length === 0) break;
    }

    for(var i = 0; i < this._items.length; i++) this._items[i].vdeKey = i;

    // this._items = this._items.sort(function(a, b) { return a.key - b.key; });
    return this._items;
  };

  prototype.item = function(i) {
    if(i.key) return i;

    var items = this.items();
    if(i > items.length) i = 0;

    return items[i];
  };

  prototype.export = function() {
    // Export w/o the circular structure
    if(!this._def && this._items.length === 0 && !this.connectedTo.host)
        return vg.duplicate(this);

    var def = this.def(), items = this.items(), connectedTo = this.connectedTo.host;

    this._def = null;
    this._items = [];
    delete this.connectedTo.host;
    if(connectedTo) this.connectedTo.hostName = connectedTo.name;

    var ex = vg.duplicate(this);
    this._def = def;
    this._items = items;
    this.connectedTo.host = connectedTo;
    delete this.connectedTo.hostName;

    return ex;
  };

  prototype.import = function(imp) {
    // In export, to prevent circular structure, we export just the connection's hostname
    if(imp.connectedTo.hostName)
      this.connectedTo.host = this.group().marks[imp.connectedTo.hostName];

    // We clear out properties, so that we don't get any lingering defaults from re-init'ing
    this.properties = {};

    // Force an assignment of these two in case gorup
    this.groupName = imp.groupName;
    this.layerName = imp.layerName;
  };

  prototype.defaults = function(/* prop */) { return null; };

  prototype.selected = function() { return {}; };
  prototype.helper   = function(/* property */) { return null; };

  prototype.propertyTargets   = function(/* connector, showGroup */) { return null; };
  prototype.connectionTargets = function() { return null; };

  prototype.connect = function(/* connector, mark */) { return null; };

  prototype.coordinates = function(/* connector, item, def */) { return null; };
  prototype.handles = function(/* item */) { return null; };
  prototype.spans = function(/* item, property */) { return null; };

  prototype.dropzones = function(area) {
    if(area.connector) {
      return {
        x: area.x-1.5*geomOffset, x2: area.x+1.5*geomOffset,
        y: area.y-1.5*geomOffset, y2: area.y+1.5*geomOffset,
        connector: area.connector,
        property: area.property,
        layout: 'point'
      };
    } else {
      if(area[0].x == area[1].x)
        return {
          x: area[0].x-2*geomOffset, x2: area[0].x+2*geomOffset,
          y: area[0].y, y2: area[1].y,
          property: area[0].span.split('_')[0],
          layout: 'vertical'
        };
      else if(area[0].y == area[1].y)
        return {
          x: area[0].x, x2: area[1].x,
          y: area[0].y-2*geomOffset, y2: area[0].y+2*geomOffset,
          property: area[0].span.split('_')[0],
          layout: 'horizontal'
        };
    }
  };

  return mark;
})();

vde.Vis.marks = {};
vde.Vis.Transform = (function() {
  var transform = function(pipelineName, type, displayName, input, output) {
    this.type = type;
    this.displayName = displayName;

    this.input = input;
    this.output = output;

    this.pipelineName = pipelineName;
    this.forkPipeline = false;  // Structural transforms cause a fork
    this.requiresFork = false;

    this.isVisual     = false;

    this.properties = {};

    return this;
  };

  var prototype = transform.prototype;

  prototype.destroy = function() { return; };

  prototype.pipeline = function() {
    return vde.Vis.pipelines[this.pipelineName];
  };

  prototype.spec = function() {
    var spec = {type: this.type};
    for(var i = 0; i < this.input.length; i++) {
      var prop   = this.input[i], value  = this.properties[prop];
      if(!value) continue;
      spec[prop] = value instanceof vde.Vis.Field ? value.spec() : value;
    }

    return spec;
  };

  prototype.bindProperty = function(prop, opts) {
    var field = opts.field;
    if(!field) return; // Because this makes negatory sense.
    if(!(field instanceof vde.Vis.Field)) field = new vde.Vis.Field(field);

    this.properties[prop] = field;
  };

  prototype.unbindProperty = function(prop) {
    delete this.properties[prop];
  };

  // Assumes data is already ingested
  prototype.transform = function(data) {
    var spec = this.spec();
    if(!spec) return data;

    var transform = vg.parse.dataflow({transform: [spec]});
    return transform(data);
  };

  // Can this transform work on facets (i.e. can it just be
  // part of the regular pipeline transform, or must we move it
  // within the group injection)
  prototype.onFork = function() { return true; };

  return transform;
})();

vde.Vis.transforms = {};

vde.Vis.marks.Symbol = (function() {
  var symbol = function(name, layerName, groupName) {
    vde.Vis.Mark.call(this, name, layerName, groupName);

    this.type = 'symbol';

    this.properties = {
      x: {value: 25},
      y: {value: 25},

      size: {value: 300},
      shape: {value: 'cross'},

      fill: {value: '#4682b4'},
      fillOpacity: {value: 1},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0.25}
    };

    this.connectors = {'point': {}};

    return this;
  };

  symbol.prototype = new vde.Vis.Mark();
  var prototype  = symbol.prototype;
  var geomOffset = 7;

  prototype.productionRules = function(prop, scale, field) {
    if(scale) return [scale, field];

    if(prop == 'size') {
      scale = this.group().scale(this, {
        domainTypes: {from: 'field'},
        domainField: field,
        rangeTypes: {type: 'sizes'}
      }, {
        properties: {type: 'linear'},
        rangeTypes: {type: 'sizes', from: 'values'},
        rangeValues: [50, 1000]
      }, 'Size');
    } else if(prop == 'shape') {
      scale = this.group().scale(this, {
        domainTypes: {from: 'field'},
        domainField: field,
        rangeTypes: {type: 'shapes'}
      }, {
        properties: {type: 'ordinal'},
        rangeTypes: {type: 'shapes', from: 'preset'},
        rangeField: new vde.Vis.Field('shapes')
      }, 'Shape');
    }

    return [scale, field];
  };

  // prototype.defaults = function(prop) {
  //   var props = this.properties;
  //   if(['x', 'y'].indexOf(prop) == -1) return;
  //   var otherProp = (prop == 'x') ? 'y' : 'x';
  //   if(!props[otherProp].scale) {
  //     this.bindProperty(otherProp, {
  //         field: new vde.Vis.Field('index', '', 'linear', this.pipelineName),
  //         pipelineName: this.pipelineName
  //       }, true);
  //   }
  // };

  prototype.selected = function() {
    var self = this,
        item = this.item(vde.iVis.activeItem),
        props = this.properties;

    var mousemove = function() {
      var dragging = vde.iVis.dragging, evt = d3.event;
      if(!dragging || !dragging.prev) return;
      if(vde.iVis.activeMark != self) return;

      var handle = (dragging.item.mark.def.name == 'handle'),
          dx = Math.ceil(evt.pageX - dragging.prev[0]);
          //dy = Math.ceil(evt.pageY - dragging.prev[1]),
          //data = dragging.item.datum.data;

      if(!handle) return;

      self.iVisUpdated = true;

      vde.iVis.ngScope().$apply(function() {
        props.size.value += dx*10;
        self.update('size');
      });

      dragging.prev = [evt.pageX, evt.pageY];
      vde.iVis.show('selected');
    };

    var mouseup = function() {
      if(self.iVisUpdated)
        vde.iVis.ngScope().$apply(function() {
          vde.iVis.ngTimeline().save();
        });

      delete self.iVisUpdated;
    };

    vde.iVis.interactor('handle', this.handles(item));
    return {
      interactors: {handle: this.handles(item)},
      evtHandlers: {mousemove: mousemove, mouseup: mouseup}
    };
  };

  prototype.helper = function(property) {
    var item = this.item(vde.iVis.activeItem);
    if(['x', 'y', 'size'].indexOf(property) == -1) return;

    vde.iVis.interactor('point', [this.connectors['point'].coords(item)])
      .interactor('span', this.spans(item, property))
      .show(['point', 'span']);
  };

  prototype.propertyTargets = function(connector, showGroup) {
    var self = this,
        item = this.item(vde.iVis.activeItem),
        spans = [], dropzones = [];

    ['x', 'y', /* 'size' */].forEach(function(p) {
      var s = self.spans(item, p);
      if(p == 'size' && self.type != 'symbol') return;
      if(p == 'size') s = [s[2], s[3]];

      dropzones = dropzones.concat(self.dropzones(s));
      spans = spans.concat(s);
    });

    if(showGroup) {
      var groupInteractors = this.group().propertyTargets();
      if(groupInteractors.spans) spans = spans.concat(groupInteractors.spans);
      if(groupInteractors.dropzones) dropzones = dropzones.concat(groupInteractors.dropzones);
    }

    vde.iVis.interactor('point', [this.connectors['point'].coords(item)])
      .interactor('span', spans)
      .interactor('dropzone', dropzones)
      .show(['point', 'span', 'dropzone']);
  };

  prototype.connectionTargets = function() {
    var self  = this,
        item  = this.item(vde.iVis.activeItem);

    var connectors = vg.keys(this.connectors).map(function(c) { return self.connectors[c].coords(item); });
    var dropzones  = connectors.map(function(c) { return self.dropzones(c); });

    vde.iVis.interactor('connector', connectors)
      .interactor('dropzone', dropzones)
      .show(['connector', 'dropzone']);
  };

  prototype.connect = function(connector, mark) {
    var props = this.properties, mProps = mark.properties,
        ox = mProps.dx.offset, oy = mProps.dy.offset;

    mark.pipelineName = this.pipelineName;

    ['x', 'y'].forEach(function(p) {
      for(var k in props[p]) mProps[p][k] = props[p][k];
    });

    mProps.dx.offset = ox || 0;
    mProps.dy.offset = oy || 0;
  };

  prototype.coordinates = function(connector, item, def) {
    if(!item) item = this.item(vde.iVis.activeItem);
    if(!item) return {x: 0, y: 0};  // If we've filtered everything out.

    var b = vde.iVis.translatedBounds(item, item.bounds);

    var coord = {
      x: b.x1 + (b.width()/2),
      y: b.y1 + (b.height()/2),
      cursor: 'se-resize',
      connector: connector,
      small: b.width() < 20 || b.height() < 20
    };
    for(var k in def) coord[k] = def[k];

    return coord;
  };

  prototype.handles = function(item) {
    var pt = this.connectors['point'].coords(item, {disabled: 0});

    if(this.properties.size.field) pt.disabled = 1;

    return [pt];
  };

  prototype.spans = function(item, property) {
    var props = this.properties,
        b  = vde.iVis.translatedBounds(item, item.bounds),
        gb = vde.iVis.translatedBounds(item.mark.group, item.mark.group.bounds),
        go = 3*geomOffset, io = geomOffset,
        pt = this.connectors['point'].coords(item); // offsets

    switch(property) {
      case 'x':
        return [{x: (gb.x1-go), y: (pt.y+io), span: 'x_0'}, {x: pt.x, y: (pt.y+io), span: 'x_0'}];

      case 'y':
        return (props.y.scale && props.y.scale.range().name == 'height') ?
          [{x: (pt.x+io), y: (gb.y2+go), span: 'y_0'}, {x: (pt.x+io), y: (pt.y), span: 'y_0'}]
        :
          [{x: (pt.x+io), y: (gb.y1-go), span: 'y_0'}, {x: (pt.x+io), y: (pt.y), span: 'y_0'}];

      case 'size':
        return [{x: b.x1, y: b.y1-io, span: 'size_0'}, {x: b.x2, y: b.y1-io, span: 'size_0'},
        {x: b.x2+io, y: b.y1, span: 'size_1'}, {x: b.x2+io, y: b.y2, span: 'size_1'}];
    }
  };

  return symbol;
})();

vde.Vis.marks.Line = (function() {
  var line = function(name, layerName, groupName) {
    vde.Vis.Mark.call(this, name, layerName, groupName);

    this.type = 'line';
    this.propType = 'points';

    this.properties = {
      x: {value: 0},
      x2: {value: 200},
      y: {value: 0},
      y2: {value: 200},

      interpolate: {value: 'monotone'},
      tension: {value: 0},

      stroke: {value: '#000000'},
      strokeWidth: {value: 2},
      strokeCap: {value: 'butt'}
    };

    vde.Vis.callback.register('vis.post_spec', this, this.dummyData);

    this.connectors = {'point': {}};

    return this;
  };

  line.prototype = new vde.Vis.Mark();
  var prototype  = line.prototype;
  var symbol = vde.Vis.marks.Symbol.prototype;

  prototype.destroy = function() {
    vde.Vis.callback.deregister('vis.post_spec',  this);
  };

  prototype.spec = function() {
    var propsForType = {
      points: ['x', 'y', 'interpolate', 'tension', 'stroke', 'strokeWidth', 'strokeOpacity', 'strokeCap'],
      path: ['path', 'fill', 'fillOpacity', 'stroke', 'strokeWidth', 'strokeCap'],
      rule: ['x', 'x2', 'y', 'y2', 'stroke', 'strokeWidth', 'strokeCap']
    };

    this.type = this.propType == 'points' ? 'line' : this.propType;

    // Vega improperly renders lines if there are extraneous properties in there.
    for(var p in this.properties) {
      if(propsForType[this.propType].indexOf(p) == -1)
        delete this.properties[p];
    }

    this.dummySpec();

    return vde.Vis.Mark.prototype.spec.call(this);
  };

  prototype.defaults = function(prop) {
    var props = this.properties;
    if(['x', 'y'].indexOf(prop) == -1) return;
    var otherProp = (prop == 'x') ? 'y' : 'x';
    if(!props[otherProp].scale) {
      this.bindProperty(otherProp, {
          field: new vde.Vis.Field('index', '', 'linear', this.pipelineName),
          pipelineName: this.pipelineName
        }, true);

      props[otherProp].default = true;
    }
  };

  prototype.selected = function() {
    var self = this, item = this.item(vde.iVis.activeItem),
        props = this.properties;
    // var points = this.items().map(function(i) { return self.connectors['point'].coords(i, {disabled: 1}) });

    var mousemove = function() {
      var dragging = vde.iVis.dragging, evt = d3.event;
      if(!dragging || !dragging.prev) return;
      if(vde.iVis.activeMark != self) return;

      var dx = Math.ceil(evt.pageX - dragging.prev[0]),
          dy = Math.ceil(evt.pageY - dragging.prev[1]),
          data = dragging.item.datum.data;

      if(!data || data.disabled) return;

      vde.iVis.ngScope().$apply(function() {
        props.x.value += dx;
        props.y.value += dy;
        self.update(['x', 'y']);
        self.iVisUpdated = true;
      });
    };

    var enabled = (this.type == 'rule' && !props.x.field && !props.y.field);

    var mouseup = function() {
      if(self.iVisUpdated)
        vde.iVis.ngScope().$apply(function() {
          vde.iVis.ngTimeline().save();
        });

      delete self.iVisUpdated;
    };

    return {
      interactors: {
        handle: [this.connectors.point.coords(item, {disabled: !enabled})]
      },
      evtHandlers: {mousemove: mousemove, mouseup: mouseup}
    };
  };

  prototype.helper = function(property) {
    return symbol.helper.call(this, property);
  };

  prototype.propertyTargets = function(connector, showGroup) {
    return symbol.propertyTargets.call(this, connector, showGroup);
  };

  prototype.coordinates = function(connector, item, def) {
    if(!item) item = this.item(vde.iVis.activeItem);
    if(!item) return {x: 0, y: 0};  // If we've filtered everything out.

    var b = new vg.Bounds().set(item.x, item.y, item.x, item.y);
    b = vde.iVis.translatedBounds(item, b);

    var coord = {x: b.x1, y: b.y1, connector: connector, small: b.width() < 20 || b.height() < 20};
    for(var k in def) coord[k] = def[k];

    return coord;
  };

  prototype.spans = function(item, property) {
    return symbol.spans.call(this, item, property);
  };

  prototype.dummySpec = function() {
    if((this.type == 'line' || this.type == 'area') &&
        !this.properties.x.field && !this.properties.y.field) {
      this._spec.from = {data: 'vdeDummyData'};
      this._spec.properties.enter = {
        x: {field: 'data.x'},
        y: {field: 'data.y'},
        y2: {value: this.group().properties.height.value}
      };
    } else {
      this._spec.from = {};
      this._spec.properties.enter = {};
    }
  };

  prototype.dummyData = function(opts) {
    if(this.properties.x.field || this.properties.y.field) return;
    var g = this.group().properties;

    opts.spec.data.push({
      name: 'vdeDummyData',
      values: [{x: 25, y: (g.height.value / 2) + 50},
        {x: (g.width.value/2) + 50, y: 25}]
    });
  };

  return line;
})();

vde.Vis.Axis = (function() {
  var axis = function(name, layerName, groupName) {
    this.name  = name;

    this.properties = {
      type: null,
      orient: null,
      scale: null,
      title: null,
      layer: 'back',

      ticks: vg.config.axis.ticks,
      tickSize: vg.config.axis.tickSize,
      tickStyle: {
        stroke: {value: vg.config.axis.tickColor},
        strokeWidth: {value: vg.config.axis.tickWidth}
      },

      labelStyle: {
        fontSize: {value: vg.config.axis.tickLabelFontSize},
        font: {value: "Helvetica"},
        angle: {value: 0},
        fill: {value: vg.config.axis.tickLabelColor}
      },

      axisStyle: {
        stroke: {value: vg.config.axis.axisColor},
        strokeWidth: {value: vg.config.axis.axisWidth}
      },

      titleOffset: vg.config.axis.titleOffset,
      titleStyle: {
        font: {value: "Helvetica"},
        fontSize: {value: vg.config.axis.titleFontSize},
        fontWeight: {value: vg.config.axis.titleFontWeight},
        fill: {value: vg.config.axis.titleColor}
      },

      gridStyle: {
        stroke: {value: vg.config.axis.gridColor},
        strokeWidth: {value: 1}
      }
    };

    this.showTitle = true;
    this.onceAcrossForks = false;

    this.layerName = layerName;
    this.groupName = groupName;
    this.pipelineName = null;

    return this.init();
  };

  var prototype = axis.prototype;

  prototype.init = function() {
    var count = this.group()._axisCount++;
    if(!this.group().isLayer()) count = this.group().group()._axisCount++;

    if(!this.name)
      this.name = 'axis_' + Date.now() + count;

    this.displayName = 'Axis ' + vde.Vis.codename(count);

    this.group().axes[this.name] = this;

    return this;
  };

  prototype.destroy = function() { return null; };

  prototype.spec = function() {
    var spec = {}, self = this;
    if(!this.properties.scale || !this.properties.scale.field()) return;

    if(!this.properties.title) {
      var inflector = vde.iVis.ngFilter()('inflector');
      this.properties.title = inflector(this.properties.scale.field().name);
    }

    vde.Vis.callback.run('axis.pre_spec', this, {spec: spec});

    vg.keys(this.properties).forEach(function(k) {
      var p = self.properties[k];
      if(p === undefined || p === null) return;

      if(k == 'scale') { spec[k] = p.name; p.used = true; }
      else if(k.indexOf('Style') != -1) return;
      else spec[k] = p;
    });

    if(!this.showTitle) delete spec.title;

    if(spec.tickValues && this.values) {
      spec.values = vg.duplicate(this.values);
      delete spec.tickValues;
    }

    spec.properties = {
      ticks: vg.duplicate(this.properties.tickStyle),
      labels: vg.duplicate(this.properties.labelStyle),
      title: vg.duplicate(this.properties.titleStyle),
      axis: vg.duplicate(this.properties.axisStyle),
      grid: vg.duplicate(this.properties.gridStyle)
    };

    if(spec.properties.labels.text &&
        Object.keys(spec.properties.labels.text).length === 0)
      delete spec.properties.labels.text;

    if(spec.properties.labels.text && spec.properties.labels.text.scale)
      spec.properties.labels.text.scale = spec.properties.labels.text.scale.name;

    vde.Vis.callback.run('axis.post_spec', this, {spec: spec});

    this.properties.scale.hasAxis = true;

    return spec.scale ? spec : null;
  };

  prototype.def = function() {
    var groupDef = this.group.def();
    for(var i = 0; i < groupDef.axes.length; i++)
        if(groupDef.axes[i].name == this.name)
            return groupDef.axes[i];

    return null;
  };

  prototype.pipeline = function() {
    return vde.Vis.pipelines[this.pipelineName];
  };

  prototype.group = function() {
    var layer = vde.Vis.groups[this.layerName];
    return this.groupName ? layer.marks[this.groupName] : layer;
  };

  prototype.bindProperty = function(prop, opts) {
    if(!opts.scaleName) return; // Because this makes no sense

    this.pipelineName = opts.pipelineName;
    var p = this.properties, props = prop.split('.');
    for(var i = 0; i < props.length - 1; i++) p = p[props[i]];

    var s = this.group().scales[opts.scaleName];
    if(!s) {
      this.group().scales[opts.scaleName] = this.pipeline().scales[opts.scaleName];
      s = this.group().scales[opts.scaleName];
    }

    p[props[props.length-1]] = s;
  };

  prototype.unbindProperty = function(prop) {
    delete this.properties[prop];
  };

  prototype.selected = function() { return {}; };

  prototype.import = function(imp) {
    // Force an assignment of these two in case groupName is null.
    this.groupName = imp.groupName;
    this.layerName = imp.layerName;
  };

  return axis;
})();

vde.Vis.callback = (function() {
	var callback = {
		_registered: {
			// type: [fns]
		}
	};

	callback.register = function(type, caller, cb) {
		if(!this._registered[type]) this._registered[type] = [];
		this._registered[type].push({
			caller: caller,
			callback: cb
		});
	};

	callback.deregister = function(type, caller) {
		var del = [], regd = (this._registered[type] || []);
		regd.forEach(function(r, i) {
			if(r.caller == caller) del.push(i);
		});

		del.forEach(function(d) { regd.splice(d, 1); });
	};

	callback.run = function(type, item, opts) {
		opts.item = item;
		(this._registered[type] || []).forEach(function(r) {
			var cb = r.callback;
			cb.call(r.caller, opts);
		});
	};

	callback.clearAll = function() {
		this._registered = {};
	};

	return callback;
})();
vde.Vis.Field = (function() {
  var field = function(name, accessor, type, pipelineName, stat) {
    if(typeof arguments[0] === 'object') {
      var f = arguments[0]; name = f.name;
      accessor = f.accessor; type = f.type;
      pipelineName = f.pipelineName; stat = f.stat;
    }

    this.name = name.replace('data.', '');
    this.accessor = accessor || '';
    this.type = type;
    this.pipelineName = pipelineName;

    this.stat = stat;

    return this;
  };

  field.prototype.spec = function() {
    return this.stat ? 'stats.' + this.stat + '_' + this.name:
      this.accessor + this.name;
  };

  field.prototype.pipeline = function() {
    return vde.Vis.pipelines[this.pipelineName];
  };

  field.prototype.raw = function() {
    return this.accessor.indexOf('data') != -1 && !this.stat;
  };

  return field;
})();

vde.Vis.Pipeline = (function() {
  var nameCount = -1;
  var pipeline = function(pipelineName, source) {
    this.name = pipelineName || 'pipeline_' + (++nameCount);
    this.displayName = 'Pipeline ' + vde.Vis.codename(nameCount);

    this.source = source;
    this.transforms = [];
    this._aggregate  = {};

    this.forkName = null;
    this.forkIdx  = null;

    this.scales = {};

    vde.Vis.pipelines[this.name] = this;

    return this;
  };

  var prototype = pipeline.prototype;

  prototype.spec = function() {
    var self = this;
    var specs = [{
      name: this.name,
      "lyra.displayName": this.displayName,
      source: this.source,
      transform: []
    }];

    vde.Vis.callback.run('pipeline.pre_spec', this, {spec: specs});

    var spec = 0;
    this.transforms.forEach(function(t, i) {
      // If we've forked and the current transform can't deal with
      // faceted data, don't add it to the regular pipeline but let
      // group injection deal with it
      if(spec > 0 && !t.onFork()) return;

      if(t.forkPipeline) {
        spec++;
        if(!self.forkName) self.forkName = self.name + '_' + t.type;
        self.forkIdx = i;

        specs.push({
          name: self.forkName,
          source: self.source,
          "lyra.role": "fork",
          "lyra.for": self.name,
          transform: vg.duplicate(specs[spec-1].transform || [])
        });
      }

      var s = t.spec();
      if(s) specs[spec].transform.push(s);
    });

    vde.Vis.callback.run('pipeline.post_spec', this, {spec: specs});

    return specs;
  };

  prototype.bookkeep = function() {
    for(var s in this.scales)
      if(!this.scales[s].used && !this.scales[s].manual) delete this.scales[s];
  };

  prototype.aggregate = function(field, stat) {
    field.stat = null;  // Erase the current state so that we get a common fieldSpec
    var fieldSpec = field.spec(), median = (stat == 'median');
    if(!this._aggregate[fieldSpec]) {
      var stats = new vde.Vis.transforms.Stats(this.name);
      stats.properties.value = fieldSpec;
      stats.properties.median = median;
      this.addTransform(stats);
      this._aggregate[fieldSpec] = stats;
    } else if(median) {
      this._aggregate[fieldSpec].properties.median = true;
    }

    field.stat = stat;
  };

  prototype.values = function(sliceBeg, sliceEnd) {
    var values = vg.duplicate(vde.Vis._data[this.source].values).map(vg.data.ingest);
    this.transforms.slice(sliceBeg, sliceEnd).forEach(function(t) {
      if(t.isVisual) return;

      values = t.transform(values);
    });

    return values;
  };

  prototype.schema = function(sliceBeg, sliceEnd) {
    var self = this,
        fields = [], seenFields = {};
    var values = vg.duplicate(vde.Vis._data[this.source].values).map(vg.data.ingest);

    var buildFields = function(data, pipeline, depth) {
      var parse = vde.Vis._data[self.source].format.parse || {};

      if(data.values && !vg.isFunction(data.values)) {
        if(!seenFields.key) {
          fields.push(new vde.Vis.Field('key', '', 'ordinal', pipeline));
          seenFields.key = true;
        }

        buildFields(data.values, pipeline, ++depth);
      }
      else {
        [data[0].data, data[0]].forEach(function(v, i) {
          if(typeof v !== 'object') {
            var field = new vde.Vis.Field('data', '');
            field.pipelineName = pipeline;
            fields.push(field);
          } else vg.keys(v).forEach(function(k, j) {
            if(i !== 0 && ['data', 'values', 'keys', 'stats'].indexOf(k) != -1) return;
            // if(k == 'key') k += '_' + depth;
            if(seenFields[k] || +k === j) return;

            var field = new vde.Vis.Field(k, (i === 0) ? 'data.' : '');
            field.pipelineName = pipeline;
            if(parse[k]) field.type = (parse[k] == 'date') ? 'time' : (parse[k] == 'number') ? 'linear' : 'ordinal';
            else field.type = vg.isNumber(v[k]) ? 'linear' : 'ordinal';

            fields.push(field);
            seenFields[k] = true;
          });
        });
      }
    };

    // Build fields once before we apply any transforms
    buildFields(values, this.name, 0);

    var pipelineName = this.name;
    this.transforms.slice(sliceBeg, sliceEnd).forEach(function(t) {
      if(t.forkPipeline) pipelineName = self.forkName;
      if(t.isVisual) return;

      if(t.type == 'stats') {
        t.spec(); // Build spec to populate fields.
        t.fields.forEach(function(f) { seenFields[f] = true; });
      }

      // If this transform can't deal with faceted values
      if(!t.onFork() && pipelineName != self.name) {

      } else {
        values = t.transform(values);
        buildFields(values, pipelineName, 0);
      }

    });

    return [fields, values];
  };

  // Given a definition, find a pre-existing scale that matches,
  // or if none do, build a new scale.
  prototype.scale = function(searchDef, defaultDef, displayName) {
    var names = {};
    for(var scaleName in this.scales) {
      var s = this.scales[scaleName];
      if(s.equals(searchDef)) return this.scales[scaleName];
      if(s.displayName.match(displayName)) names[s.displayName] = 1;
    }

    if(displayName in names) {
      var count = 2;
      displayName += count;
      while(displayName in names) displayName = displayName.replace(count, ++count);
    }

    for(var k in defaultDef)
      searchDef[k] = defaultDef[k];

    return new vde.Vis.Scale('', this, searchDef, displayName);
  };

  // Figure out where to add the transform:
  // If the transform requires a fork, add it to the end
  // otherwise, assume look at properties to see where to
  // add it
  prototype.addTransform = function(t) {
    t.pipelineName = this.name;
    if(!this.forkName || t.forkPipeline || t.requiresFork) return this.transforms.push(t);
    else {
      var self = this, pipelineName = this.name;
      var checkField = function(f) {
        pipelineName = f.pipelineName;
        if(pipelineName == self.forkName || f.stat) {
          pipelineName = self.forkName;
          return true;
        }
        return false;
      };
      vg.keys(t.properties).some(function(k) {
        var f = t.properties[k];
        if(f instanceof vde.Vis.Field) return checkField(f);
      });

      if(t.exprFields) t.exprFields.some(function(f) { return checkField(f); });

      if(pipelineName == this.forkName) return this.transforms.push(t);
      else { this.transforms.splice(this.forkIdx, 0, t); return this.forkIdx;}
    }
  };

  return pipeline;
})();

vde.Vis.Scale = (function() {
  var scale = function(name, pipeline, defaults, displayName) {
    var scaleName = 'scale_r' + Date.now();
    this.name  = (name || pipeline.name + '_' + scaleName);
    this.displayName = displayName;

    this.domainTypes = {from: 'field'};  // Field or Values
    this.rangeTypes  = {type: 'spatial', from: 'preset'};  // 'property' key if type is 'other'

    this.domainField = null;
    this.rangeField  = null;

    this.domainValues = [];
    this.rangeValues  = [];

    this.used = false;    // Auto-delete unused scales
    this.manual = false;  // Manually create scales should always stick around

    this.hasAxis  = false;  // Does this scale already have an axis/legend on the vis
    this.axisType = 'x';    // If not, visualize it on iVis when editing
    this.inheritFromGroup = false; // Drawn domain from group's dataset?

    this.properties = {
      type: 'linear',
      points: true,
      nice: true,
      // clamp: false
      padding: 0,
      // exponent: 0,
      zero: true
    };

    for(var d in defaults) {
      if(d == 'properties') continue;
      this[d] = defaults[d];
    }

    for(var d in defaults.properties) this.properties[d] = defaults.properties[d];

    this.pipelineName = pipeline.name;
    pipeline.scales[this.name] = this;

    return this;
  };

  var prototype = scale.prototype;

  prototype.spec = function() {
    var spec = vg.duplicate(this.properties);
    if(!this.pipeline()) return;

    vde.Vis.callback.run('scale.pre_spec', this, {spec: spec});

    spec.name = this.name;

    var field = this.domainField;
    spec.domain = (this.domainTypes.from == 'field' && field) ? 
      { data:  field.stat ? field.pipeline().forkName : field.pipelineName,
        field: field.stat ? field.spec().replace('stats.','') : field.spec() 
      } : this.domainValues;
    spec.inheritFromGroup = this.inheritFromGroup;  // Easiest way of picking this up in group injection

    spec.range = (this.rangeTypes.from == 'preset' && this.rangeField) ?
      this.rangeField.spec() : this.rangeValues;

    spec["lyra.displayName"] = this.displayName;
    delete spec.pipeline;
    delete spec.field;
    if(spec.type == 'quantize') delete spec.nice;
    if(spec.type == 'time' && spec.nice === true) delete spec.nice;

    vde.Vis.callback.run('scale.post_spec', this, {spec: spec});

    return spec;
  };

  prototype.def = function() {
    // TODO

    return null;
  };

  prototype.type  = function() { return this.properties.type; };
  prototype.field = function() { return this.domainTypes.from == 'field' ? this.domainField : this.domainValues; };
  prototype.range = function() { return this.rangeTypes.from == 'preset'  ? this.rangeField  : this.rangeValues; };

  prototype.pipeline = function() {
    return vde.Vis.pipelines[this.pipelineName];
  };

  prototype.equals = function(b) {
    var a = {};
    var aFromB = function(a, b, self) {
      for(var k in b) {
        var isObj = vg.isObject(b[k]) &&
          !vg.isArray(b[k]) && !(b[k] instanceof vde.Vis.Field);
        a[k] = isObj ? {} : self[k];
        if(isObj) aFromB(a[k], b[k], self[k]);
      }
    };

    aFromB(a, b, this);

    return JSON.stringify(a) == JSON.stringify(b);
  };

  prototype.bindProperty = function(prop, opts) {
    var field = opts.field;
    if(!field) return; // Because this makes negatory sense.
    if(!(field instanceof vde.Vis.Field)) field = new vde.Vis.Field(field);

    this[prop] = field;
  };

  prototype.unbindProperty = function(prop) {
    delete this[prop];
  };

  return scale;
})();

vde.Vis.marks.Arc = (function() {
  var arc = function(name, layerName, groupName) {
    vde.Vis.Mark.call(this, name, layerName, groupName);

    this.type = 'arc';

    this.properties = {
      x: {value: 0},
      y: {value: 0},

      startAngle: {value: -30},
      endAngle: {value: 60},
      innerRadius: {value: 0},
      outerRadius: {value: 100},

      fill: {value: '#4682b4'},
      fillOpacity: {value: 1},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0.25}
    };

    this.connectors = {
      'point': {}, 'pie': {}
    };

    return this;
  };

  arc.prototype = new vde.Vis.Mark();
  var prototype  = arc.prototype;

  prototype.property = function(prop) {
    if(prop == 'startAngle' || prop == 'endAngle') {
      var newProp = vg.duplicate(this.properties[prop]);
      if(newProp.field) return vde.Vis.parseProperty(this.properties, prop);
      newProp.value = newProp.value / 180 * Math.PI;
      return newProp;
    }

    return vde.Vis.parseProperty(this.properties, prop);
  };

  prototype.productionRules = function(prop, scale, field) {
    if(!scale) {
      switch(prop) {
        case 'innerRadius':
        case 'outerRadius':
          scale = this.group().scale(this, {
            domainTypes: {from: 'field'},
            domainField: field,
            rangeTypes: {type: 'other', property: prop}
          }, {
            properties: {type: 'sqrt'},
            rangeTypes: {type: 'other', from: 'values', property: prop},
            rangeValues: (prop == 'innerRadius') ? [0, 50] : [0, 100]
          }, prop);

        break;
      }
    }

    return [scale, field];
  };

  prototype.bindProperty = function(prop, opts, defaults) {
    if(prop !== 'pie') {
      return vde.Vis.Mark.prototype.bindProperty.call(this, prop, opts, defaults);
    } else {
      if(!opts.pipelineName || !opts.field) return;
      var pipeline = vde.Vis.pipelines[opts.pipelineName],
          pie = null;

      // TODO: replace with Harmony [].find?
      pipeline.transforms.some(function(t) {
        if(t.type === 'pie') return pie = t;
        return false;
      });

      if(!pie) {
        pie = new vde.Vis.transforms.Pie(opts.pipelineName);
        pipeline.addTransform(pie);
      }

      pie.bindProperty('value', opts);
      this.bindProperty('startAngle', {field:pie.output.startAngle});
      this.bindProperty('endAngle', {field:pie.output.endAngle});
    }

  };

  var geomOffset = 7;
  prototype.spans = function(item, property) {
    var props = this.properties,
        b  = vde.iVis.translatedBounds(item, item.bounds),
        gb = vde.iVis.translatedBounds(item.mark.group, item.mark.group.bounds),
        go = 3*geomOffset, io = geomOffset,
        pt = this.connectors['point'].coords(item); // offsets

    switch(property) {
      case 'x':
        return [{x: (gb.x1-go), y: (pt.y+io), span: 'x_0'}, {x: pt.x, y: (pt.y+io), span: 'x_0'}];

      case 'y':
        return (props.y.scale && props.y.scale.range().name == 'height') ?
          [{x: (pt.x+io), y: (gb.y2+go), span: 'y_0'}, {x: (pt.x+io), y: (pt.y), span: 'y_0'}]
        :
          [{x: (pt.x+io), y: (gb.y1-go), span: 'y_0'}, {x: (pt.x+io), y: (pt.y), span: 'y_0'}];
    }
  };

  prototype.propertyTargets = function(connector, showGroup) {
    var self = this,
        item = this.item(vde.iVis.activeItem),
        spans = [], dropzones = [];

    ['x', 'y'].forEach(function(p) {
      var s = self.spans(item, p);

      dropzones = dropzones.concat(self.dropzones(s));
      spans = spans.concat(s);
    });

    if(showGroup) {
      var groupInteractors = this.group().propertyTargets();
      if(groupInteractors.spans) spans = spans.concat(groupInteractors.spans);
      if(groupInteractors.dropzones) dropzones = dropzones.concat(groupInteractors.dropzones);
    }

    var pie = this.connectors['pie'].coords(item);
    pie.startAngle = item.startAngle;
    pie.endAngle = item.endAngle;
    pie.outerRadius = item.outerRadius;
    pie.property = 'pie';

    vde.iVis.interactor('pie', [pie])
      .interactor('span', spans)
      .interactor('dropzone', dropzones)
      .show(['point', 'span', 'dropzone', 'pie']);
  };


  prototype.selected = function() {
    /*var startPoint = {
      x: item.outerRadius * Math.sin(item.startAngle),
      y: -item.outerRadius * Math.cos(item.startAngle)
    };
    var endPoint = {
      x: item.outerRadius * Math.sin(item.endAngle),
      y: -item.outerRadius * Math.cos(item.endAngle)
    };*/

    var self = this, item = this.item(vde.iVis.activeItem),
        props = this.properties;

    var mousemove = function() {
      var dragging = vde.iVis.dragging, evt = d3.event;
      if(!dragging || !dragging.prev) return;
      if(vde.iVis.activeMark != self) return;

      var dx = Math.ceil(evt.pageX - dragging.prev[0]),
          dy = Math.ceil(evt.pageY - dragging.prev[1]),
          data = dragging.item.datum.data;

      vde.iVis.ngScope().$apply(function() {
        props.x.value += dx;
        props.y.value += dy;
        self.update(['x', 'y']);
        self.iVisUpdated = true;
      });

      dragging.prev = [evt.pageX, evt.pageY];
      vde.iVis.show('selected');
    };

    var mouseup = function() {
      if(self.iVisUpdated) {
        vde.iVis.ngScope().$apply(function() {
          vde.iVis.ngTimeline().save();
        });
      }
    };

    return {
      interactors: {
        handle: [this.connectors.point.coords(item, {})]
      },
      evtHandlers: {mousemove: mousemove, mouseup: mouseup}
    };
  };

  prototype.coordinates = function(connector, item, def) {
    if(!item) item = this.item(vde.iVis.activeItem);
    if(!item) return {x: 0, y: 0};  // If we've filtered everything out.
    var b = new vg.Bounds().set(item.x, item.y, item.x, item.y);
    b = vde.iVis.translatedBounds(item, b);

    var coord = {x: b.x1, y: b.y1, connector: connector, small: b.width() < 20 || b.height() < 20};

    for(var k in def) coord[k] = def[k];

    return coord;
  };

  return arc;
})();

vde.Vis.marks.Area = (function() {
  var area = function(name, layerName, groupName) {
    vde.Vis.Mark.call(this, name, layerName, groupName);

    this.type = 'area';

    this.properties = {
      x: {value: 0},
      y: {value: 0},
      y2: {value: 0},

      interpolate: {value: 'monotone'},
      tension: {value: 0},

      fill: {value: '#4682b4'},
      fillOpacity: {value: 1},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0.25}
    };

    vde.Vis.callback.register('vis.post_spec', this, function(opts) {
      return vde.Vis.marks.Line.prototype.dummyData.call(this, opts);
    });

    this.connectors = {'point': {}};

    return this;
  };

  area.prototype = new vde.Vis.Mark();
  var prototype  = area.prototype;
  var line = vde.Vis.marks.Line.prototype;

  prototype.spec = function() {
    line.dummySpec.call(this);
    return vde.Vis.Mark.prototype.spec.call(this);
  };

  prototype.defaults = function(prop) {
    if(prop == 'y') {
      this.properties.y2 = {
        scale: this.properties.y.scale,
        value: 0
      };
    }

    return line.defaults.call(this, prop);
  };

  prototype.selected = function() { return line.selected.call(this); };
  prototype.helper = function(property) { return line.helper.call(this, property); };
  prototype.propertyTargets = function(connector, showGroup) {
    return line.propertyTargets.call(this, connector, showGroup);
  };

  prototype.coordinates = function(connector, item, def) {
    return line.coordinates.call(this, connector, item, def);
  };

  prototype.spans = function(item, property) { return line.spans.call(this, item, property); };

  return area;
})();

vde.Vis.marks.Group = (function() {
  var nameCount = -1;
  var group = function(name, layerName, groupName) {
    vde.Vis.Mark.call(this, name || 'layer_' + (++nameCount), layerName, groupName);

    this.displayName = 'Layer ' + vde.Vis.codename(nameCount);
    this.type   = 'group';
    this.layer  = true;  // A psuedo-group exists in the spec, but not in the VDE UI.
    this.layerName = layerName || this.name;

    this.scales = {};
    this.axes   = {};
    this.marks  = {};
    this.markOrder = [];

    this._spec.scales   = [];
    this._spec.axes   = [];
    this._spec.marks  = [];

    this.fillType = 'color';
    this.properties = {
      x: {value: 0},
      width: {value: vde.Vis.properties.width},
      x2: {value: 0, disabled: true},
      y: {value: 0},
      height: {value: vde.Vis.properties.height},
      y2: {value: 0, disabled: true},
      clip: {value: false},

      fill: {value: '#ffffff'},
      fillOpacity: {value: 0},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0}
    };

    this.connectors = {
      'top-left': {}, 'top-center': {}, 'top-right': {},
      'middle-left' : {}, 'middle-center': {}, 'middle-right': {},
      'bottom-left': {}, 'bottom-center': {}, 'bottom-right': {}
    };

    // Maintain counts at the layer level to properly name marks/axes
    this._markCount = 0;
    this._axisCount = 0;

    return this.init();
  };

  group.prototype = new vde.Vis.Mark();
  var prototype = group.prototype;

  prototype.init = function() {
    if(this.isLayer()) {
      vde.Vis.groups[this.name] = this;
      vde.Vis.groupOrder.push(this.name);
    }

    return vde.Vis.Mark.prototype.init.call(this);
  };

  prototype.update = function(props) {
    vde.Vis.Mark.prototype.update.call(this, props);

    var layout = props.indexOf('layout') != -1;
    if(layout) this.doLayout(this.layout);

    // Because a group could affect sub-marks, re-parse the submarks
    for(var m in this.marks)
      this.marks[m].update(['x', 'x2', 'width', 'y', 'y2', 'height']);

    if(layout) vde.Vis.render();

    return this;
  };

  prototype.spec = function() {
    var self = this;
    var spec = vg.duplicate(vde.Vis.Mark.prototype.spec.call(this));

    // We should be smarter than this.
    vg.keys(spec.properties.enter).forEach(function(k) {
      var p = spec.properties.enter[k];
      if(p.field) p.field = p.field.replace('stats.', '');
    });

    vde.Vis.callback.run('group.pre_spec', this, {spec: spec});

    ['scales', 'axes'].forEach(function(t) {
      vg.keys(self[t]).forEach(function(k) {
        var s = self[t][k].spec();
        if(!s) return;
        if(s.inheritFromGroup && !self.isLayer()) delete s.domain.data;
        spec[t].push(s);
      });
    });

    // Reverse order of marks: earlier in markOrder => closer to front
    this.markOrder.forEach(function(m) {
      var s = self.marks[m].spec();
      if(!s) return;
      spec.marks.unshift(s);
    });

    spec["lyra.groupType"] = this.isLayer() ? 'layer' : 'group';

    vde.Vis.callback.run('group.post_spec', this, {spec: spec});

    return spec;
  };

  prototype.bookkeep = function() {
    for(var s in this.scales)
      if(!this.scales[s].used && !this.scales[s].manual) delete this.scales[s];
  };

  prototype.scale = function(mark, searchDef, defaultDef, displayName) {
    var scale = mark.pipeline().scale(searchDef, defaultDef, displayName);
    if(!this.isLayer()) this.group().scales[scale.name] = scale;
    this.scales[scale.name] = scale;

    return scale;
  };

  prototype.annotate = function() {
    this._def = null;
    this._items = [];
    this.def();

    for(var m in this.marks) {
      this.marks[m]._def = null;
      this.marks[m]._items = [];
      this.marks[m].def();
      if(this.marks[m].type == 'group') this.marks[m].annotate();
    }
  };

  prototype.export = function() {
    // Export w/o circular structure in marks
    if(!this._def && this._items.length === 0) return vg.duplicate(this);
    var marks = this.marks, def = this.def(), items = this.items();

    // We save it to _marks in case of nested groups, which need to stick
    // around in this.marks
    this._marks = {};
    for(var m in marks) {
      var ex = marks[m].export();
      this._marks[ex.name] = ex;
    }
    this._def = null;
    this._items = [];
    this.marks = this._marks;
    delete this._marks;

    var exported = vg.duplicate(this);
    this.marks = marks;
    this._def = def;
    this._items = items;

    return exported;
  };

  prototype.isLayer = function() {
    return this.layerName == this.name;
  };

  prototype.bindProperty = function(prop, opts) {
    if(!opts.pipelineName || !opts.field) return;

    var pipeline = vde.Vis.pipelines[opts.pipelineName], facet = vde.Vis.transforms.Facet;
    var transform = new facet();
    transform.bindProperty('keys', opts);
    transform.properties.layout =
        vde.Vis.transforms.Facet[(prop == facet.dropzone_horiz) ? 'layout_horiz' : 'layout_vert'];

    pipeline.addTransform(transform);
  };

  prototype.doLayout = function(layout) {
    var facet = vde.Vis.transforms.Facet, self = this;

    var copyFromLayer = function(props) {
      props.forEach(function(prop) {
        self.properties[prop] = {};
        var fromProp = self.group().properties[prop];
        if(fromProp.scale) self.properties[prop].scale = fromProp.scale;
        if(fromProp.field)
          self.properties[prop].field = new vde.Vis.Field(fromProp.field.name,
              fromProp.field.accessor, fromProp.field.type, fromProp.field.pipelineName,
              fromProp.field.stat);
        if(fromProp.hasOwnProperty('value')) self.properties[prop].value = fromProp.value;
        if(fromProp.disabled) self.properties[prop].disabled = fromProp.disabled;
      });
    };

    if(layout == facet.layout_overlap) {
      copyFromLayer(['x', 'width', 'x2', 'y', 'height', 'y2']);
    } else {
      var isHoriz = layout == facet.layout_horiz;
      var scale = this.group().scale(this, {
        domainTypes: {from: 'field'},
        domainField: new vde.Vis.Field('key', '', 'ordinal', this.pipeline().forkName),
        rangeTypes: {type: 'spatial', from: 'preset'},
        rangeField: new vde.Vis.Field(isHoriz ? 'width' : 'height')
      }, {
        properties: {type: 'ordinal', padding: 0.2}
      }, 'Groups');
      scale.properties.points = false;

      var keyField = {
        scale: scale,
        field: new vde.Vis.Field('key', '', 'ordinal', this.pipeline().forkName)
      };

      var bandField = { scale: scale, value: 'auto' };

      if(isHoriz) {
        this.properties.x = keyField;
        this.properties.width = bandField;
        this.properties.x2.disabled = true;
        copyFromLayer(['y', 'height', 'y2']);
      } else {
        this.properties.y = keyField;
        this.properties.height = bandField;
        this.properties.y2.disabled = true;
        copyFromLayer(['x', 'width', 'x2']);
      }
    }

    this.layout = layout;
  };

  prototype.selected = function() {
    // Since groups are fancy rects
    var self = this, selected = vde.Vis.marks.Rect.prototype.selected.call(this);

    // But we want to reparse the spec on mouseup (i.e. interactive resize)
    // to get the axes to do the right thing.
    selected.evtHandlers.mouseup = function() {
      if(self.iVisUpdated) {
        vde.Vis.render();

        vde.iVis.ngScope().$apply(function() {
          vde.iVis.ngTimeline().save();
        });
      }
    };

    return selected;
  };

  // A group should only have propertyTargets, if it's a layer so that we can
  // use it to do grouping+layout.
  prototype.propertyTargets = function() {
    var self = this, item = this.item(vde.iVis.activeItem || 0),
        dropzones = [], spans = [];

    if(!self.isLayer()) return {};

    // We want the width/height spans of a rect mark, and then when binding,
    // we'll interpret them as horizontal/vertical group by layout.
    var facet = vde.Vis.transforms.Facet;
    [facet.dropzone_horiz, facet.dropzone_vert].forEach(function(prop) {
      var span = self.spans(item, prop);
      var zone = self.dropzones(span);
      if(prop == facet.dropzone_horiz) {
        zone.hint = facet.hint_horiz;
//        zone.y += 15; zone.y2 += 15;
      } else {
        zone.hint = facet.hint_vert;
//        zone.x += 15; zone.x2 += 15;
      }
      dropzones = dropzones.concat(zone);
      spans     = spans.concat(span);
    });
    return {spans: [], dropzones: dropzones};
  };

  prototype.coordinates = function(connector, item, def) {
    return vde.Vis.marks.Rect.prototype.coordinates.call(this, connector, item, def);
  };

  prototype.handles = function(item) {
    return vde.Vis.marks.Rect.prototype.handles.call(this, item);
  };

  prototype.spans = function(item, property) {
    return vde.Vis.marks.Rect.prototype.spans.call(this, item, property);
  };

  return group;
})();

vde.Vis.marks.Rect = (function() {
  var rect = function(name, layerName, groupName) {
    vde.Vis.Mark.call(this, name, layerName, groupName);

    this.type = 'rect';
    this.fillType = 'color'; // color || image

    this.properties = {
      x: {value: 25},
      width: {value: 30},
      x2: {value: 0, disabled: true},
      y: {value: 25},
      height: {value: 30},
      y2: {value: 0, disabled: true},
      fill: {value: '#4682b4'},
      fillOpacity: {value: 1},
      stroke: {value: '#000000'},
      strokeWidth: {value: 0.25},

      // For image marks
      url: {},
      align: {value: 'center'},
      baseline: {value: 'middle'}
    };

    this.extents = {
      horizontal: {fields: ['x', 'x2', 'width'], limit: 2, history: ['x', 'width']},
      vertical: {fields: ['y', 'y2', 'height'],  limit: 2, history: ['y', 'height']}
    };

    this.connectors = {
      'top-left': {}, 'top-center': {}, 'top-right': {},
      'middle-left' : {}, 'middle-center': {}, 'middle-right': {},
      'bottom-left': {}, 'bottom-center': {}, 'bottom-right': {}
    };

    this.inferredHints = {};

    return this;
  };

  rect.prototype = new vde.Vis.Mark();
  var prototype  = rect.prototype;
  var geomOffset = 7; // Offset from rect for the interactive geometry

  prototype.spec = function() {
    if(this.fillType == 'image') {
      this._spec.type = 'image';
    } else {
      delete this.properties.url;
      delete this.properties.align;
      delete this.properties.baseline;
    }

    return vde.Vis.Mark.prototype.spec.call(this);
  };

  prototype.productionRules = function(prop, scale, field, defaults) {
    var self = this,
        props = this.extents.horizontal.fields.indexOf(prop) != -1 ?
          this.extents.horizontal.fields : this.extents.vertical.fields;

    // If we're not dropping over a dropzone, don't ever do inference.
    // If we're dropping over a width/height dropzone, wait to infer
    // later on in the bind process.
    if(!defaults || (defaults && (prop == 'width' || prop == 'height')))
      return [scale, field];

    // To ease construction of extents, we try to infer and reuse a scale from
    // existing extent bindings. However, the user can choose to override this
    // inference, in which case bindProperty + productionRules are called again.
    // So, we check to ensure we only infer a scale if we haven't already for this
    // property.
    if(!scale && !this.properties[prop].inferred && props.indexOf(prop) != -1)
      props.some(function(p) {
        if( (scale = self.properties[p].scale) ) {
          self.properties[prop].inferred = true;
          self.inferredHints[prop] = {
            hint: "Lyra inferred this binding and chose to re-use a scale.",
            action: "Create a new scale"
          };
          return true;
        }
      });
    else
      delete this.properties[prop].inferred;

    if(prop == 'url') field.type = 'encoded';
    return [scale, field];
  };

  prototype.defaults = function(prop) {
    var props = this.properties, isOrd = props[prop].scale.type() == 'ordinal';
    // If we set the width/height, by default map x/y
    if(['width', 'height'].indexOf(prop) == -1) return;
    var scaledProp = (prop == 'width') ? isOrd ? 'x' : 'x2' : 'y';
    var zeroProp   = (prop == 'width') ? isOrd ? 'x2' : 'x' : 'y2';

    props[scaledProp] = {
      scale: props[prop].scale,
      field: props[prop].field,
      default: true
    };

    if(isOrd) {
      delete props[prop].field;
      props[prop].value = 'auto';
    } else {
      props[zeroProp] = {
        scale: props[prop].scale,
        value: 0,
        default: true
      };

      this.unbindProperty(prop);
      props[prop].disabled = true;

      // Check to see if the other property has been assigned
      // if not, assign it to index
      // var scaledOther = false;
      // otherProps.some(function(o) { return (scaledOther = !!props[o].scale); })
      // if(!scaledOther) {
      //   this.bindProperty(otherProps[2], {
      //     field: new vde.Vis.Field('index', '', 'ordinal', this.pipelineName),
      //     pipelineName: this.pipelineName
      //   }, true);
      // }
    }
  };

  prototype.selected = function() {
    var self = this, item = this.item(vde.iVis.activeItem);

    var mousemove = function() {
      var dragging = vde.iVis.dragging, evt = d3.event;
      if(!dragging || !dragging.prev) return;
      if(vde.iVis.activeMark != self) return;
      var props = self.properties,
          dx = Math.ceil(evt.pageX - dragging.prev[0]),
          dy = Math.ceil(evt.pageY - dragging.prev[1]),
          data = dragging.item.datum.data,
          handle = (dragging.item.mark.def.name == 'handle');

      // Since we're updating a value, pull the current value from the
      // scenegraph directly rather than properties. This makes it easier
      // to cope with rangeBands and {scale, value} properties.
      var updateValue = function(prop, delta) {
        if(!props[prop].disabled && !props[prop].field) {
          props[prop] = {value: item[prop] + delta};
          self.iVisUpdated = true;
        }
      };

      delete self.iVisUpdated;

      vde.iVis.ngScope().$apply(function() {
        var reverse;
        if(!handle) {
          updateValue('y', dy);
          updateValue('x', dx);
          self.update(['y', 'x']);
        } else if(data.connector) {
          if(data.connector.indexOf('top') != -1) {
            reverse = (props.y.scale &&
                props.y.scale.range().name == 'height') ? -1 : 1;

            updateValue('y', dy*reverse);
            updateValue('height', dy*-1);
            self.update(['y', 'y2', 'height']);
          }

          if(data.connector.indexOf('bottom') != -1) {
            reverse = (props.y2.scale &&
                props.y2.scale.range().name == 'height') ? -1 : 1;

            updateValue('y2', dy*reverse);
            updateValue('height', dy);
            self.update(['y', 'y2', 'height']);
          }

          if(data.connector.indexOf('left') != -1) {
            updateValue('x', dx);
            updateValue('width', dx*-1);
            self.update(['x', 'x2', 'width']);
          }

          if(data.connector.indexOf('right') != -1) {
            updateValue('x2', dx);
            updateValue('width', dx);
            self.update(['x', 'x2', 'width']);
          }
        }
      });

      dragging.prev = [evt.pageX, evt.pageY];
      vde.iVis.show('selected');
    };

    var mouseup = function() {
      if(self.iVisUpdated)
        vde.iVis.ngScope().$apply(function() {
          vde.iVis.ngTimeline().save();
        });
    };

    return {
      interactors: {handle: this.handles(item)},
      evtHandlers: {mousemove: mousemove, mouseup: mouseup}
    };
  };

  prototype.helper = function(property) {
    var item = this.item(vde.iVis.activeItem),
        c = this.connectors, propConnectors = [];
    if(['x', 'x2', 'width', 'y', 'y2', 'height'].indexOf(property) == -1) return;

    switch(property) {
      case 'x': propConnectors = [c['top-left'].coords(item), c['bottom-left'].coords(item)]; break;
      case 'x2': propConnectors = [c['top-right'].coords(item), c['bottom-right'].coords(item)]; break;
      case 'width': propConnectors = [c['top-left'].coords(item), c['top-right'].coords(item)]; break;

      case 'y': propConnectors = [c['top-left'].coords(item), c['top-right'].coords(item)]; break;
      case 'y2': propConnectors = [c['bottom-left'].coords(item), c['bottom-right'].coords(item)]; break;
      case 'height': propConnectors = [c['top-left'].coords(item), c['bottom-left'].coords(item)]; break;
    }

    vde.iVis.interactor('point', propConnectors)
      .interactor('span', this.spans(item, property))
      .show(['point', 'span']);
  };

  prototype.propertyTargets = function(connector, showGroup) {
    var self  = this,
        item  = this.item(vde.iVis.activeItem),
        props = [],
        spans = [], dropzones = [];

    var connToSpan = {
      'top-left': {props: ['x', 'y'], span: 0},
      'bottom-right': {props: ['x2', 'y2'], span: 1}
    };

    if(connector) props = connToSpan[connector].props;
    if(props.length === 0) props = ['width', 'height'];

    if(showGroup) {
      var groupInteractors = this.group().propertyTargets();
      if(groupInteractors.spans) spans = spans.concat(groupInteractors.spans);
      if(groupInteractors.dropzones) dropzones = dropzones.concat(groupInteractors.dropzones);
    }

    props.forEach(function(prop) {
      var span = self.spans(item, prop);

      if(connector !== null && connector !== undefined && connToSpan[connector])
        span = span.reduce(function(acc, s) {
          // Offset dropzones for top-left connector to prevent overlaps
          if(connector == 'top-left' && prop == 'x') s.y += 2*geomOffset;
          if(connector == 'top-left' && prop == 'y') s.x += 2*geomOffset;

          if(s.span == prop + '_' + connToSpan[connector].span) acc.push(s);
          return acc;
        }, []);

      dropzones = dropzones.concat(self.dropzones(span));
      spans = spans.concat(span);
    });

    // Order is important with dropzones to ensure on overlap, the connector dropzones
    // take precendence.
    var connectors = [this.connectors['top-left'].coords(item), this.connectors['bottom-right'].coords(item)];
    dropzones = dropzones.concat(connectors.map(function(c) { return self.dropzones(c); }));

    var mouseover = function(e, item) {
      if(!vde.iVis.dragging || item.mark.def.name != 'dropzone') return;
      if(item.connector)  // For points, switch propertyTargets after a timeout.
        vde.iVis.dropzoneTimeout = window.setTimeout(function() {
          self.propertyTargets((item.connector == connector) ? '' : item.connector, showGroup);
        }, vde.iVis.timeout);
    };

    var clearTimeout = function(e, item) {
      if(!vde.iVis.dragging || item.mark.def.name != 'dropzone') return;
      window.clearTimeout(vde.iVis.dropzoneTimeout);
    };

    vde.iVis.interactor('point', connectors)
      .interactor('span', spans)
      .interactor('dropzone', dropzones)
      .show(['point', 'span', 'dropzone'], {
        mouseover: mouseover,
        mouseout: clearTimeout,
        mouseup: clearTimeout
      });
  };

  prototype.connectionTargets = function() {
    var self  = this,
        item  = this.item(vde.iVis.activeItem);

    var connectors = vg.keys(this.connectors).map(function(c) { return self.connectors[c].coords(item); });
    connectors.sort(function(a) { return a.connector.indexOf('center') ? 1 : -1; });
    var dropzones  = connectors.map(function(c) { return self.dropzones(c); });

    vde.iVis.interactor('connector', connectors)
      .interactor('dropzone', dropzones)
      .show(['connector', 'dropzone']);
  };

  prototype.connect = function(connector, mark) {
    var props = this.properties, mProps = mark.properties,
        ox = mProps.dx.offset, oy = mProps.dy.offset;

    var setProp = function(p1, p2) {
      for(var k in props[p2]) mProps[p1][k] = props[p2][k];
    };

    mark.pipelineName = this.pipelineName;

    // TODO: what if x2/width or y2/height are set instead: -ve mult dx/dys
    setProp('x', 'x');
    setProp('y', 'y');

    if(connector.indexOf('center') != -1) {
      if(props.width.disabled) {
        setProp('dx', 'x2');
        mProps.x.mult = mProps.dx.mult = 0.5;
      } else {
        setProp('dx', 'width');
        mProps.dx.mult = 0.5;
      }
    }

    if(connector.indexOf('right') != -1)
      setProp('dx', props.width.disabled ? 'x2' : 'width');

    if(connector.indexOf('middle') != -1) {
      if(props.height.disabled) {
        setProp('dy', 'y2');
        mProps.y.mult = mProps.dy.mult = 0.5;
      } else {
        setProp('dy', 'height');
        mProps.dy.mult = 0.5;
      }
    }

    if(connector.indexOf('bottom') != -1) {
      if(props.height.disabled) setProp('y', 'y2');
      else setProp('dy', 'height');
    }

    mProps.dx.offset = ox || 0;
    mProps.dy.offset = oy || 0;
  };

  prototype.coordinates = function(connector, item, def) {
    if(!item) item = this.item(vde.iVis.activeItem);
    if(!item) return {x: 0, y: 0};  // If we've filtered everything out.

    var bounds = item.bounds;
    // For groups, we can't use item.bounds because that reflects the max bounds of all enclosed elems
    if(this.type == 'group')
      bounds = new vg.Bounds().set(item.x, item.y, item.x + item.width, item.y + item.height);
    var b = vde.iVis.translatedBounds(item, bounds),
        coord = {};

    switch(connector) {
      case 'top-left': coord = {x: b.x1, y: b.y1, cursor: 'nw-resize'}; break;
      case 'top-center': coord = {x: b.x1 + (b.width()/2), y: b.y1, cursor: 'n-resize'}; break;
      case 'top-right': coord = {x: b.x2, y: b.y1, cursor: 'ne-resize'}; break;
      case 'middle-left': coord = {x: b.x1, y: b.y1 + (b.height()/2), cursor: 'w-resize'}; break;
      case 'middle-center': coord = {x: b.x1 + (b.width()/2), y: b.y1 + (b.height()/2), cursor: 'move'}; break;
      case 'middle-right': coord = {x: b.x2, y: b.y1 + (b.height()/2), cursor: 'e-resize'}; break;
      case 'bottom-left': coord = {x: b.x1, y: b.y2, cursor: 'sw-resize'}; break;
      case 'bottom-center': coord = {x: b.x1 + (b.width()/2), y: b.y2, cursor: 's-resize'}; break;
      case 'bottom-right': coord = {x: b.x2, y: b.y2, cursor: 'se-resize'}; break;
    }

    coord.connector = connector;
    coord.small = b.width() < 20 || b.height() < 20 ? 1 : 0;
    for(var k in def) coord[k] = def[k];

    return coord;
  };

  prototype.handles = function(item) {
    var props = this.properties,
        handles = {};

    for(var c in this.connectors)
      handles[c] = this.connectors[c].coords(item, {disabled: 0});

    delete handles['middle-center'];

    var checkExtents = function(extents, hndls) {
      var count = 0;
      extents.forEach(function(e) { if(props[e].field) count++; });
      if(count > 2) hndls.forEach(function(h) { handles[h].disabled = 1; });
    };

    checkExtents(['y', 'y2', 'height'], ['top-center', 'bottom-center']);
    if(props.y.field) handles['top-center'].disabled = 1;
    if(props.y2.field) handles['bottom-center'].disabled = 1;
    if(props.height.field)
      handles['top-center'].disabled = handles['bottom-center'].disabled = 1;

    checkExtents(['x', 'x2', 'height'], ['middle-left', 'middle-right']);
    if(props.x.field) handles['middle-left'].disabled = 1;
    if(props.x2.field) handles['middle-right'].disabled = 1;
    if(props.width.field)
      handles['middle-left'].disabled = handles['middle-right'].disabled = 1;

    // Now figure out the corners
    ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(function(corner) {
      var h = corner.split('-');
      if(handles[h[0] + '-center'].disabled || handles['middle-' + h[1]].disabled)
        handles[corner].disabled = 1;
    });

    return vg.keys(handles).map(function(h) { return handles[h]; });
  };

  prototype.spans = function(item, property) {
    var props = this.properties,
        b  = vde.iVis.translatedBounds(item, item.bounds),
        gb = vde.iVis.translatedBounds(item.mark.group, item.mark.group.bounds),
        go = 3*geomOffset, io = geomOffset; // offsets

    var facet = vde.Vis.transforms.Facet;

    switch(property) {
      case 'x':
        return [{x: (gb.x1-go), y: (b.y1-io), span: 'x_0'}, {x: b.x1, y: (b.y1-io), span: 'x_0'},
         {x: (gb.x1-go), y: (b.y2+io), span: 'x_1'}, {x: b.x1, y: (b.y2+io), span: 'x_1'}];

      case 'x2':
        return [{x: (gb.x1-go), y: (b.y1-io), span: 'x2_0'}, {x: b.x2, y: (b.y1-io), span: 'x2_0'},
         {x: (gb.x1-go), y: (b.y2+io), span: 'x2_1'}, {x: b.x2, y: (b.y2+io), span: 'x2_1'}];

      case facet.dropzone_horiz: /* falls through */
      case 'width': return [{x: b.x1, y: (b.y1-io), span: property + '_0'}, {x: b.x2, y: (b.y1-io), span: property + '_0'}];

      case 'y':
        return (props.y.scale && props.y.scale.range().name == 'height') ?
          [{x: (b.x1-io), y: (gb.y2+go), span: 'y_0'}, {x: (b.x1-io), y: b.y1, span: 'y_0'},
           {x: (b.x2+io), y: (gb.y2+go), span: 'y_1'}, {x: (b.x2+io), y: b.y1, span: 'y_1'}]
        :
        [{x: (b.x1-io), y: (gb.y1-go), span: 'y_0'}, {x: (b.x1-io), y: b.y1, span: 'y_0'},
         {x: (b.x2+io), y: (gb.y1-go), span: 'y_1'}, {x: (b.x2+io), y: b.y1, span: 'y_1'}];

      case 'y2': 
        return (props.y2.scale && props.y2.scale.range().name == 'height') ?
          [{x: (b.x1-io), y: (gb.y2+go), span: 'y2_0'}, {x: (b.x1-io), y: b.y2, span: 'y2_0'},
           {x: (b.x2+io), y: (gb.y2+go), span: 'y2_1'}, {x: (b.x2+io), y: b.y2, span: 'y2_1'}]
        :
          [{x: (b.x1-io), y: (gb.y1-go), span: 'y2_0'}, {x: (b.x1-io), y: b.y2, span: 'y2_0'},
           {x: (b.x2+io), y: (gb.y1-go), span: 'y2_1'}, {x: (b.x2+io), y: b.y2, span: 'y2_1'}];

      case facet.dropzone_vert: /* falls through */
      case 'height': 
        // Show the vertical group by dropzone on the LHS (x1) but the rect height dropzone on the RHS (x2)
        var x = this.type == 'group' ? b.x1-io : b.x2+io;
        return [{x: x, y: b.y1, span: property + '_0'}, {x: x, y: b.y2, span: property + '_0'}];
    }
  };

  return rect;
})();

vde.Vis.marks.Text = (function() {
  var text = function(name, layerName, groupName) {
    vde.Vis.Mark.call(this, name, layerName, groupName);

    this.type = 'text';

    this.properties = {
      x: {value: 0},
      y: {value: 0},

      text: null,
      textFormula: '"Text"',
      textFormulaHtml: 'Text',

      align: {value: 'center'},
      baseline: {value: 'middle'},
      dx: {value: 0, offset: 0},
      dy: {value: 0, offset: 0},
      angle: {value: 0},
      font: {value: 'Helvetica'},
      fontSize: {value: 12},
      fontWeight: {value: 'normal'},
      fontStyle: {value: 'normal'},

      fill: {value: '#4682b4'}
    };

    this.exprFields = [];

    this.canConnect = true;
    this.connectors = {
      'text': {},
      'left': {}, 'right': {}
    };

    return this;
  };

  text.prototype = new vde.Vis.Mark();
  var prototype  = text.prototype;
  var geomOffset = 7;

  prototype.formulaName = function() {
    return 'vdeTextFormula_' + this.group().name + '_' + this.name;
  };

  prototype.from = function() {
    return {transform: [{
      type: 'formula',
      field: this.formulaName(),
      expr: this.properties.textFormula
    }]};
  };

  prototype.spec = function() {
    this._spec.from = this.from();
    this.properties.text = {field: new vde.Vis.Field(this.formulaName())};

    return vde.Vis.Mark.prototype.spec.call(this);
  };

  prototype.update = function(prop) {
    if(!prop) prop = "";
    if(prop.indexOf('text') != -1) {
      var def = this.def();

      // Copied from vg.parse.parse
      var name = this.pipelineName,
          tx = vg.parse.dataflow(this.from());
      def.from = function(db, group, parentData) {
        var data = vg.scene.data(name ? db[name] : null, parentData);
        return tx(data, db, group);
      };
    }

    return vde.Vis.Mark.prototype.update.call(this, prop);
  };

  prototype.productionRules = function(prop, scale, field) {
    if(prop == 'text') {
      var schema = $('<div class="schema" contenteditable="false">' + field.name + '</div>')
          .attr('field-spec', (field instanceof vde.Vis.Field) ? field.spec() : null)
          .toggleClass('raw',     field.raw())
          .toggleClass('derived', !field.raw());

      this.properties.textFormula = 'd.' + field.spec();
      this.properties.textFormulaHtml = $('<div>').append(schema).html();

      scale = field = null;
    } else if(!scale) {
      var defaultDef = {},
          searchDef  = {
            domainTypes: {from: 'field'},
            domainField: field,
            rangeTypes: {type: 'other', property: prop}
          };

      switch(prop) {
        case 'fontSize':
          defaultDef = {
            properties: {type: 'linear'},
            rangeTypes: {type: 'other', property: prop, from: 'values'},
            rangeValues: [8, 21]
          };
        break;

        case 'fontWeight':
          defaultDef = {
            properties: {type: 'quantize'},
            rangeTypes: {type: 'other', property: prop, from: 'values'},
            rangeValues: ['normal', 'bold']
          };
        break;

        case 'fontStyle':
          defaultDef = {
            properties: {type: 'quantize'},
            rangeTypes: {type: 'other', property: prop, from: 'values'},
            rangeValues: ['normal', 'italic']
          };
        break;
      }

      if(vg.keys(defaultDef).length > 0)
        scale = this.group().scale(this, searchDef, defaultDef, prop);
    }

    return [scale, field];
  };

  prototype.selected = function() {
    var self = this,
        item = this.item(vde.iVis.activeItem),
        props = this.properties, conn = this.connectedTo,
        connector = null;

    var mousemove = function() {
      var dragging = vde.iVis.dragging, evt = d3.event;
      if(!dragging || !dragging.prev) return;
      if(vde.iVis.activeMark != self) return;

      var handle = (dragging.item.mark.def.name == 'handle'),
          dx = Math.ceil(evt.pageX - dragging.prev[0]),
          dy = Math.ceil(evt.pageY - dragging.prev[1]),
          data = dragging.item.datum.data;

      self.iVisUpdated = true;

      vde.iVis.ngScope().$apply(function() {
        if(handle) {
          if(evt.metaKey && !props.angle.field) { // Rotate
            var b  = vde.iVis.translatedBounds(item, item.bounds),
                o  = $('#vis canvas').offset(),
                cx = b.x1 + b.width()/2,
                cy = b.y1 + b.height()/2;

            var rad = Math.atan2(evt.pageX - (o.left + cx), evt.pageY - (o.top + cy));
            var deg = (rad * (180 / Math.PI) * -1) + 90;
            props.angle.value = Math.round(deg);
            self.update('angle');
          } else {
            var ds = Math.sqrt(dx*dx + dy*dy);
            if((data.connector == 'left' && (dx > 0 || dy > 0)) ||
              (data.connector == 'right' && (dx < 0 || dy < 0))) ds*=-1;
            props.fontSize.value = Math.round(props.fontSize.value + ds/5);
            if(props.fontSize.value < 1) props.fontSize.value = 1;
            self.update('fontSize');
          }
        } else {
          if(self.connectedTo.host) {
            props.dx.offset += dx;
            props.dy.offset += dy;

            self.update(['dx', 'dy']);
          } else {
            if(!props.x.field) props.x.value += dx;
            if(!props.y.field) props.y.value += dy;

            self.update(['x', 'y']);
          }
        }
      });

      dragging.prev = [evt.pageX, evt.pageY];
      vde.iVis.show('selected');
    };

    var mouseup = function() {
      if(self.iVisUpdated)
        vde.iVis.ngScope().$apply(function() {
          vde.iVis.ngTimeline().save();
        });

      delete self.iVisUpdated;
    };

    var keydown = function() {
      var e = d3.event;
      if(vde.iVis.activeMark != self) return;
      if(!e.metaKey) return;

      vde.iVis.ngScope().$apply(function() {
        switch(e.keyCode) {
          case 66: // b
            props.fontWeight.value = (props.fontWeight.value == 'normal') ? 'bold' : 'normal';
          break;

          case 73: // i
            props.fontStyle.value = (props.fontStyle.value == 'normal') ? 'italic' : 'normal';
          break;
        }

        self.update(['fontWeight', 'fontStyle']);
      });
    };

    if(conn.host) {
      // Because they're connected, we should be able to look up the host item
      var hostItem  = conn.host.item(vde.iVis.activeItem);
      connector = conn.host.connectors[conn.connector].coords(hostItem, {connected: 1});
    }

    return {
      interactors: {
        handle: this.handles(item),
        connector: connector ? [connector] : [],
        connection: this.spans(item, 'connection')
      },
      evtHandlers: {mousemove: mousemove, mouseup: mouseup, keydown: keydown}
    };
  };

  prototype.helper = function(property) {
    var item = this.item(vde.iVis.activeItem);
    if(['x', 'y', 'dx', 'dy'].indexOf(property) == -1) return;

    vde.iVis.interactor('point', [this.connectors['text'].coords(item)])
      .interactor('span', this.spans(item, property))
      .show(['point', 'span']);
  };

  prototype.propertyTargets = function(connector, showGroup) {
    var self = this,
        item = this.item(vde.iVis.activeItem),
        spans = [], dropzones = [];

    if(!this.connectedTo.host) {
      ['x', 'y'].forEach(function(p) {
        var s = self.spans(item, p);
        dropzones = dropzones.concat(self.dropzones(s));
        spans = spans.concat(s);
      });
    }

    var connectors = [this.connectors['text'].coords(item)];
    connectors[0].property = 'text';
    dropzones = dropzones.concat(connectors.map(function(c) { return self.dropzones(c); }));

    if(showGroup) {
      var groupInteractors = this.group().propertyTargets();
      if(groupInteractors.spans) spans = spans.concat(groupInteractors.spans);
      if(groupInteractors.dropzones) dropzones = dropzones.concat(groupInteractors.dropzones);
    }

    vde.iVis.interactor('point', connectors)
      .interactor('span', spans)
      .interactor('dropzone', dropzones)
      .show(['point', 'span', 'dropzone']);
  };

  prototype.coordinates = function(connector, item, def) {
    if(!item) item = this.item(vde.iVis.activeItem);
    if(!item) return {x: 0, y: 0};  // If we've filtered everything out.
    var coord = {}, b;

    if(connector == 'text') {
      b  = vde.iVis.translatedBounds(item,
          new vg.Bounds({x1: item.x, x2: item.x, y1: item.y, y2: item.y}));
      coord = {x: b.x1, y: b.y1, cursor: 'move'};

      if(this.connectedTo.host) { coord.x += item.dx; coord.y += item.dy; }
    } else {
      b = new vg.Bounds();
      vg.scene.bounds.text(item, b, true);  // Calculate text bounds w/o rotating
      b.rotate(item.angle*Math.PI/180, item.x||0, item.y||0);
      b = vde.iVis.translatedBounds(item, b);

      coord = (connector == 'left') ?
        {x: b.x1, y: b.y1, cursor: 'nw-resize'} : {x: b.x2, y: b.y2, cursor: 'se-resize'};
    }

    coord.connector = connector;
    coord.small     = false;
    for(var k in def) coord[k] = def[k];

    return coord;
  };

  prototype.handles = function(item) {
    var left = this.connectors.left.coords(item, {disabled: 0}),
        right = this.connectors.right.coords(item, {disabled: 0});

    return [left, right];
  };

  prototype.spans = function(item, property) {
    var props = this.properties,
        gb = vde.iVis.translatedBounds(item.mark.group, item.mark.group.bounds),
        go = 3*geomOffset, io = geomOffset,
        pt = this.connectors['text'].coords(item),
        dx = item.dx, dy = item.dy; // offsets

    switch(property) {
      case 'x':
        return [{x: (gb.x1-go), y: (pt.y+io), span: 'x_0'}, {x: pt.x, y: (pt.y+io), span: 'x_0'}];

      case 'y': 
        return (props.y.scale && props.y.scale.range().name == 'height') ?
          [{x: (pt.x+io), y: (gb.y2+go), span: 'y_0'}, {x: (pt.x+io), y: (pt.y), span: 'y_0'}]
        :
          [{x: (pt.x+io), y: (gb.y1-go), span: 'y_0'}, {x: (pt.x+io), y: (pt.y), span: 'y_0'}];
      case 'dx':
        return [{x: pt.x, y: (pt.y+io), span: 'dx_0'}, {x: pt.x + dx, y: (pt.y+io), span: 'dx_0'}];

      case 'dy':
        return [{x: (pt.x+io), y: pt.y, span: 'dy_0'}, {x: (pt.x+io), y: (pt.y+dy), span: 'dy_0'}];

      case 'connection':
        if(!this.connectedTo.host) return [];
        var conn = this.connectedTo;
        var hostItem = conn.host.item(vde.iVis.activeItem);
        var connector = conn.host.connectors[conn.connector].coords(hostItem);
        var textConnector = this.connectors.text.coords(item);
        return [{x: connector.x, y: connector.y, span: 'connection_0'}, {x: textConnector.x, y: textConnector.y, span: 'connection_0'}];
    }
  };

  return text;
})();

vde.Vis.parse = (function() {

  var vis = vde.Vis,
      dataSources,
      dataToLoad,
      pipelines,
      defaultPipeline,
      warnings,
      SUPPORTED_TRANSFORMS,
      TRANSFORM_PROPERTIES,
      MARK_CONSTRUCTORS,
      MARK_HANDLERS,
      SHARED_MARK_PROPERTIES,
      SCALE_PRESETS,
      unique_id = (function() {
        var i = 0;
        function unique_id() {
          return i++;
        }
        return unique_id;
      })();

  parse.init = function() {
    dataSources = {};
    dataToLoad = [];
    pipelines = {};
    warnings = [];
  };

  function parse(spec) {
    parse.init();

    spec = vg.duplicate(spec);
    vis.reset();

    vis.properties.width = spec.width;
    vis.properties.height = spec.height;
    if(typeof spec.padding === 'number') {
      vis.properties._autopad = false;
      vis.properties.padding = {
        top: spec.padding,
        bottom: spec.padding,
        left: spec.padding,
        right: spec.padding,
      };
    } else if(typeof spec.padding === 'object') {
      vis.properties.padding = spec.padding;
      vis.properties._autopad = false;
    } else if(spec.padding === 'auto'){
      vis.properties.padding = {};
      vis.properties._autopad = true;
    } else {
      vis.properties.padding = {top:30, left:30, right:30, bottom:30};
      vis.properties._autopad = true;
      warn('unknown padding "' + spec.padding + '". Using "auto"');
    }

    parse.moveObjectsIntoLayers(spec);
    parse.dataSources(spec);
    parse.makePipelines(spec);
    parse.layers(spec);

    return vde.iVis.ngQ()
      .all(dataToLoad)
      .then(vis.render.bind(vis, true))
      .then(function() {
        return warnings;
      });
  }


  parse.moveObjectsIntoLayers = function (spec) {
    function makeDefaultLayer() {
      if(!defaultLayer) {
        defaultLayer = {
          type: 'group',
          from: {},
          name: 'lyra_default_layer_' + unique_id(),
          scales: [],
          axes: [],
          marks: [],
          properties: {
            enter:{
              x:{value: 0},
              y:{value: 0},
              height:{value: vis.properties.height},
              width:{value: vis.properties.width}
            }
          },
          'lyra.displayName': 'Default Layer'
        };
        spec.marks.push(defaultLayer);
      }
      return defaultLayer;
    }

    var defaultLayer;
    //the only allowed top-level objects are layers.
    ['marks', 'axes', 'scales'].forEach(function(prop) {
      spec[prop] = spec[prop] || [];
      //move all elements into a layer.
      spec[prop].forEach(function(obj, i, arr) {
        if(obj['lyra.groupType'] !== 'layer') {
          //move object into default layer.
          arr[i] = null;
          makeDefaultLayer()[prop].push(obj);
        }
      });
      //filter out removed elements
      spec[prop] = spec[prop].filter(function(a) { return a; });
    });

    return spec;
  }

  parse.dataSources = function(spec) {
    //Find inline data sources
    (spec.marks || []).forEach(function hoistInlineDataSource(m) {
      var parent = this,
          markName = m['lyra.displayName'] || m.name || m.type;
      var name;
      if(!m.from || !m.from.data) {
        m.from = m.from || {};
        m.from.data = parent.from.data;
      }
      if(m.from.transform) {
        var id = unique_id();
        name = 'lyra_inline_' + id + '_' + markName + '_' + m.from.data;
        spec.data.push({
          name: name,
          source: m.from.data,
          auto: true,
          transform: m.from.transform,
          'lyra.role' : m.from['lyra.role'],
          'lyra.for': m.from['lyra.for'],
          'lyra.start': true,
          'lyra.displayName': '(Inline ' + id + ': ' + markName + ')' 
        });
        m.from.data = name;
        delete m.from.transform;
      }

      (m.marks || []).forEach(hoistInlineDataSource, m);
    }, {from:{}});

    //index data sources by name.
    spec.data.forEach(function populateName(d) {
      dataSources[d.name] = d;
      d.transform = d.transform || [];
    });

    //join pipeline forks into single data sources
    spec.data = spec.data.filter(function joinForks(d) {
      var source;
      if(d['lyra.role'] === 'fork') {
        source = dataSources[d['lyra.for']];
        dataSources[d.name] = source;
        d.transform.splice(0, d['lyra.start'] ? 0 : source.transform.length);
        source.transform = source.transform.concat(d.transform);
        return false;
      }
      return true;
    });

    //lyra does not support pipelines sourcing from other pipelines
    spec.data.forEach(function untangleSource(d) {
      var source = d.source,
          sourceObj = source && dataSources[source],
          k, transforms;

      if(source && (sourceObj.source || sourceObj.transform && sourceObj.transform.length)) {
        untangleSource(sourceObj);
        transforms = d.transform;
        for(k in sourceObj) {
          if(k !== 'name') d[k] = sourceObj[k];
        }
        d.transform = d.transform.concat(transforms);
      }
    });

    //group injection can cause duplicate transforms in each pipeline
    spec.data.forEach(function removeDuplicateTransforms(d) {
      d.transform = d.transform.filter(function(tr, i, arr) {
        transformLoop: for(var j = 0; j < i; j++) {
          for(var k in tr) {
            if(tr[k] !== arr[j][k]) continue transformLoop;
          }
          return false;
        }
        return true;
      });
    });

    return spec;
  }

  parse.makePipelines = function(spec) {
    //now, we can make the pipelines
    spec.data.forEach(function makePipeline(d) {
      var pipeline;
      if(d.url || d.values) {
        //we need to load some data
        dataToLoad.push(vis.data(d.name, d.url || d.values, d.format || 'json'));
      }
      if(d['lyra.role'] !== 'data_source') {
        pipeline = new vis.Pipeline(null, d.source || d.name);
        pipeline.displayName = d['lyra.displayName'] || d.name;
        pipeline.renamedStatsFields = {};
        pipelines[d.name] = pipeline;
        if(!defaultPipeline) {
          defaultPipeline = pipeline;
        }
        d.transform.forEach(function(tr) {
          pipeline.addTransform(parse.transform(tr, pipeline));
        });
      }
    });
  }


  //Transform properties that require special handling.
  TRANSFORM_PROPERTIES = {
    keys: function(keys, tr, transform) { 
      return keys.map(function(key) {
        return parse.field(key, transform.pipeline());
      });
    },
    test: function(expr, tr, transform) {
      transform.properties.test = expr;
      transform.properties.testHtml = htmlExpr(expr, transform, transform.pipeline());
    },
    expr: function(expr, tr, transform) {
      transform.properties.expr = expr;
      transform.properties.exprHtml = htmlExpr(expr, transform, transform.pipeline());
    },
    layout: function() {
      return vis.transforms.Facet.layout_overlap;
    },
    field: function(field, tr, transform) {
      if(tr.type === 'formula') return field;
      else {
        return parse.field(field, transform.pipeline());
      }
    },
    order: function(_, tr) { return /^\-/.test(tr.by) ? 'Descending' : 'Ascending'; },
    by: function(by, tr, transform) {
      return parse.field(by.replace(/^\-/,''), transform.pipeline());
    },
    output: function(output, tr, transform) {
      for(var k in output) {
        transform.pipeline().renamedStatsFields = pipeline.renamedStatsFields || {};
        transform.pipeline().renamedStatsFields[output[k]] = k;
      }
    },
    size: function(size) { return size || 2; },
    step: function(step) { return step || 1; },
    projection: function(projection, tr, transform) {
      //just a hook to allow us to set geoType for geo and geopath transforms
      transform.geoType = tr.type == 'geo' ? 'Latitude/Longtitude' : 'GeoJSON';
      return projection;
    },
    value: function(field, tr, transform) {
      field = parse.field(field, transform.pipeline());
      if(tr.type === 'stats') {
        transform.properties.field = field;
      } else {
        return field;
      }
    },
    point: function(field, tr, transform) { return parse.field(field, transform.pipeline()); },
    height: function(field, tr, transform) { return parse.field(field, transform.pipeline()); }
  };

  SUPPORTED_TRANSFORMS = {facet:'Facet', filter:'Filter', formula:'Formula', sort:'Sort', stats:'Stats', window:'Window', force:'Force', geo:'Geo', geopath:'Geo', pie:'Pie', stack:'Stack'};
  parse.transform = function(tr, pipeline) {
    var conName = SUPPORTED_TRANSFORMS[tr.type],
        constructor = conName && vis.transforms[conName],
        transform;

    if(!constructor) parse.fail("Unsupported transform: " + tr.type);
    transform = new constructor(pipeline.name);
    //Parse all of the input properties of the transform. 
    transform.input.forEach(function parseProperty(k) {
      var result;
      if(TRANSFORM_PROPERTIES[k]) {
        result = TRANSFORM_PROPERTIES[k](tr[k], tr, transform);
        if(result !== undefined) {
          transform.properties[k] = result;
        }
      } else {
        transform.properties[k] = tr[k];
      }
    });
    return transform;
  }

  parse.field = function(text, pipeline) {
    var tokens = text.split('.'),
        name = tokens.pop(),
        accessor = tokens.length > 0 ? tokens.join('.').replace(/^d\./,'') + '.' : '',
        field, newStatName, statsTransform, k;
    if(accessor === 'stats.' || accessor === '') {
      if(pipeline.transforms.some(function(a){
        return statsTransform = a, a.type === 'stats';
      })) {
        newStatName = pipeline.renamedStatsFields[name];
        if(newStatName)
          field = new vis.Field(statsTransform.properties.field.name, 'stats.', null, pipeline.name, newStatName);
        else
          field = new vis.Field(name, accessor, null, pipeline.name);
      } else {
        field = new vis.Field(name, accessor, null, pipeline.name);
      }
    } else {
      field = new vis.Field(name, accessor, null, pipeline.name);
    }
    return field;
  }

  SHARED_MARK_PROPERTIES = ['x','x2','y','y2','width','height','opacity','fill','fillOpacity','stroke','strokeWidth','strokeOpacity','strokeDash','strokeDashOffset'];
  parse.layers = function(spec) {
    spec.marks.forEach(function(layerSpec) {
      var layerObj = new vis.marks.Group(layerSpec.name);

      layerSpec.properties = layerSpec.properties || {};
      layerSpec.properties.enter = layerSpec.properties.enter || {};
      layerSpec.properties.update = layerSpec.properties.update || {};

      layerObj.displayName = layerSpec['lyra.displayName'] || layerSpec.name;

      SHARED_MARK_PROPERTIES.forEach(function(prop) {
        copyProp(prop, layerSpec, layerObj);
      });

      parse.container(layerSpec, layerObj);
    });
  }

  parse.container = function(spec, layer, group) {
    var info = {
      layer: layer,
      group: group
    };

    (spec.scales || []).forEach(parse.scale, info);
    (spec.marks || []).forEach(parse.mark, info);
    (spec.axes || []).forEach(parse.axis, info);

    if(spec.legends && spec.legends.length) {
      warn("Lyra does not support legends");
    }
  }

  MARK_CONSTRUCTORS = {rect:'Rect', image:'Rect', symbol:'Symbol', arc:'Arc', area:'Area', line:'Line', text:'Text', group: 'Group'};
  MARK_HANDLERS = {
    image: {
      props: ['url', 'baseline', 'align'],
      fn: function(info, mark, markObj) {
        markObj.fillStyle = 'image';
      }
    },
    symbol: {props: ['size', 'shape']},
    arc: {props: ['innerRadius','outerRadius','startAngle','endAngle']},
    area: {props: ['interpolate', 'tension']},
    line: {props: ['interpolate', 'tension']},
    text: {
      props: ['text','align','baseline','dx','dy','radius','theta','angle','font','fontSize','fontWeight','fontStyle'],
      fn: function(info, mark, markObj) {
        markObj.properties.textFormula = 'd.' + markObj.properties.text.field.spec();
        markObj.properties.textFormulaHtml = htmlExpr(markObj.properties.textFormula, markObj, markObj.pipeline());
      }
    },
    group: {
      fn: function(info, mark, markObj) {
        parse.container(mark, info.layer, markObj);
      }
    }
  }
  parse.mark = function(mark) {
    mark.properties = mark.properties || {};
    mark.properties.enter = mark.properties.enter || {};
    mark.properties.update = mark.properties.update || {};
    var info = this,
        conName = MARK_CONSTRUCTORS[mark.type],
        constructor = vis.marks[conName],
        handler = MARK_HANDLERS[mark.type] || {},
        pipeline = pipelines[mark.from.data],
        markObj, facetTransform, props;
    if(!constructor) { parse.fail("Unsupported mark type: " + mark.type); }

    if(mark.type === 'group') {
      if(!pipeline.transforms.some(function(transform) {
        facetTransform = transform;
        return transform.type === 'facet';
      })) {
        parse.fail("Group marks must be layers or derive from facet transforms. Use 'lyra.groupType': 'layer' for layers.")
      }
      markObj = facetTransform.group(info.layer);
      props = mark.properties.enter;
      if(!props.x && !props.x2 || !props.x && !props.width || !props.x2 && !props.width) {
        props.x = {value: 0};
        props.width = info.layer.properties.width || info.layer.properties.x2;
      }
      if(!props.y && !props.y2 || !props.y && !props.height || !props.y2 && !props.height) {
        props.y = {value: 0};
        props.height = info.layer.properties.height || info.layer.properties.y2;
      }
    } else {
      markObj = new constructor(mark.name, info.layer.name, info.group && info.group.name);
    }

    markObj.pipelineName = pipeline.name;
    markObj.displayName = mark['lyra.displayName'] || mark.name || markObj.name;

    SHARED_MARK_PROPERTIES.forEach(function(prop) {
      copyProp(prop, mark, markObj);
    });
    handler.props && handler.props.forEach(function(prop) {
      copyProp(prop, mark, markObj);
    });
    handler.fn && handler.fn(info, mark, markObj);

    if(mark.type !== 'group') markObj.init();

  }

  function copyProp(prop, spec, obj) {
    var any = false;
    if(spec.properties.enter[prop]) {
      any = true;
      obj.properties[prop] = parse.valueRef(spec.properties.enter[prop], obj);
    }
    if(spec.properties.update[prop]) {
      any = true;
      obj.properties[prop] = parse.valueRef(spec.properties.update[prop], obj);
    }
    if(!any) {
      obj.properties[prop] && (obj.properties[prop].disabled = true);
    }
  }

  parse.valueRef = function(ref, mark) {
    ref = vg.duplicate(ref);
    if(ref.group || ref.mult) {
      return parse.fail("Unsupported ValueRef " + JSON.stringify(ref));
    }
    if(!('value' in ref || 'field' in ref)) {
      ref.field = 'data';
    }
    if(ref.field) { ref.field = parse.field(ref.field, mark.pipeline()); }
    if(ref.scale) {
      ref.scale = mark.group().scales[ref.scale] || mark.group().group().scales[ref.scale];
    }
    if(ref.band) { ref.value = 'auto'; }
    return ref;
  }

  function htmlExpr(expr, object, pipeline) {
    return expr.replace(/d\.([\w\.]+)/g, function(match2, match) {
      var bindingScope = vde.iVis.ngScope().$new(),
          binding;
      bindingScope.field = parse.field(match, pipeline);
      object.exprFields.push(bindingScope.field);
      binding = vde.iVis.ngCompile()('<vde-binding style="display: none" field="field"></vde-binding>')(bindingScope);
      bindingScope.$apply();
      return binding.find('.schema').attr('contenteditable', 'false').wrap('<p>').parent().html();
    });
  }

  parse.axis = function(ax) {
    var info = this,
        layer = info.layer,
        groupName = info.group && info.group.name || null;
    var axis = new vis.Axis(ax.name, layer.name, groupName);
    vg.extend(axis.properties, ax);
    axis.properties.scale = layer.scales[axis.properties.scale];
    axis.pipelineName = axis.properties.scale.pipeline().name;
  }

  SCALE_PRESETS = {width:1, height:1, shapes:1, category10:1, category20:1};
  parse.scale = function(scale) {
    var info = this,
        layer = info.layer,
        pipeline = parseDomain(scale.domain) || info.group && info.group.pipeline() || defaultPipeline,
        obj = new vis.Scale(scale.name, pipeline, {}, scale["lyra.displayName"] || scale.name);
    obj.used = true;
    obj.manual = true;
    if(!scale.domain) {
      obj.domainTypes.from = 'field';
    } else if(scale.domain.data) {
      obj.domainTypes.from = 'field';
      obj.domainField = parse.field(scale.domain.field, pipeline);
    } else {
      obj.domainTypes.from = 'values';
      obj.domainValues = scale.domain;
    }

    if(!scale.range) {
      obj.rangeTypes.from = 'field';
    } else if(scale.range.from) {
      obj.rangeTypes.from = 'field';
      obj.rangeField = parse.field(scale.range.field, pipeline);
    } else if(SCALE_PRESETS[scale.range]){
      obj.rangeTypes.from = 'preset';
      obj.rangeField = new vis.Field(scale.range, '', '', pipeline.name);
    } else {
      obj.rangeTypes.from = 'values';
      obj.rangeValues = scale.range;
    }

    obj.properties.type = scale.type;
    obj.properties.zero = scale.zero;
    obj.properties.nice = scale.nice;
    obj.properties.padding = scale.padding;
    obj.properties.points = scale.points;

    layer.scales[scale.name] = obj;
    function parseDomain(domain) {
      return (domain && domain.data) ? pipelines[domain.data] : null;
    }
  }

  function warn(msg) {
    warnings.push(msg);
  }

  parse.fail = function(msg) {
    throw new Error("Unable to import Vega spec: " + msg + ". Fix errors and try again.");
  }

  return parse;
})();
vde.Vis.transforms.Facet = (function() {
  var facet = function(pipelineName) {
    vde.Vis.Transform.call(this, pipelineName, 'facet', 'Group By', ['keys', 'sort', 'layout']);

    // Because facets perform structural transformations, fork
    // whatever pipeline this is assigned to.
    this.forkPipeline = true;

    this.properties.keys = [];

    this._groups = {};
    this._transforms = [];

    // Instead of registering post_spec callbacks on each of the primitives
    // (marks, axes), we'll now just register one on vis.pre_group.
    // Here, we'll do all the re-arranging into subgroups that we want, and
    // let spec gen run like normal.
    vde.Vis.callback.register('pipeline.post_spec', this, this.pipelinePostSpec);
    vde.Vis.callback.register('group.pre_spec', this, this.groupPreSpec);
    vde.Vis.callback.register('group.post_spec', this, this.groupPostSpec);
    vde.Vis.callback.register('mark.post_spec', this, this.markPostSpec);

    return this;
  };

  facet.prototype = new vde.Vis.Transform();
  var prototype = facet.prototype;

  facet.layout_overlap = 'Overlap';
  facet.layout_horiz = 'Horizontal';
  facet.layout_vert = 'Vertical';

  facet.dropzone_horiz = 'facetLayoutHoriz';
  facet.hint_horiz     = 'Grouped Horizontally';
  facet.dropzone_vert  = 'facetLayoutVert';
  facet.hint_vert      = 'Grouped Vertically';

  prototype.destroy = function() {
    vde.Vis.callback.deregister('pipeline.post_spec',  this);
    vde.Vis.callback.deregister('group.pre_spec', this);
    vde.Vis.callback.deregister('group.post_spec', this);
    vde.Vis.callback.deregister('mark.post_spec',  this);

    if(this.pipeline()) {
      for(var layerName in vde.Vis.groups) {
        var layer = vde.Vis.groups[layerName];
        if(this.groupName() in layer.marks) {
          var group = layer.marks[this.groupName()];
          for(var markName in group.marks) {
            group.marks[markName].groupName = null;
            layer.marks[markName] = group.marks[markName];
            layer.markOrder.push(markName);
          }

          for(var axisName in group.axes) {
            group.axes[axisName].groupName = null;
            layer.axes[axisName] = group.axes[axisName];
          }

          for(var scaleName in group.scales)
            if(!(scaleName in layer.scales)) layer.scales[scaleName] = group.scales[scaleName];

          delete layer.marks[this.groupName()];
          layer.markOrder.splice(layer.markOrder.indexOf(this.groupName()), 1);
        }
      }

      this.pipeline().forkName = null;
      this.pipeline().forkIdx  = null;
    }
  };

  prototype.spec = function() {
    var spec = {type: 'facet'};
    if(this.properties.keys.length)
      spec.keys = this.properties.keys.map(function(k) { return k.spec(); });

    return spec;
  };

  prototype.groupName = function() { return this.pipelineName + '_facet'; };

  prototype.bindProperty = function(prop, opts) {
    var field = opts.field, props = this.properties;
    if(!field) return; // Because this makes negatory sense.
    if(!(field instanceof vde.Vis.Field)) field = new vde.Vis.Field(field);

    if(prop == 'keys') {
      if(!props.keys) props.keys = [];
      props.keys.push(field);
    } else this.properties[prop] = field;
  };

  prototype.pipelinePostSpec = function(opts) {
    if(!this.pipeline() || !this.pipeline().forkName) return;
    if(this.properties.keys.length === 0) return;
    if(opts.item.name != this.pipelineName) return;

    // Grab the transforms that must work within each facet, and them to our group
    var self = this;
    this._transforms = [];
    opts.item.transforms.forEach(function(t) { if(!t.onFork()) self._transforms.push(t.spec()); });
  };

  prototype.groupPreSpec = function(opts) {
    if(!this.pipeline() || !this.pipeline().forkName) return;
    if(this.properties.keys.length === 0) return;

    if(opts.item.isLayer()) {
      this._layer(opts.item);
    } else if(opts.item.name == this.groupName()) {
      opts.spec.from.data = this.pipeline().forkName;
    }
  };

  // Once all the specs have been generated, see if any marks/scales have been
  // marked to inherit their data from the facet group.
  prototype.groupPostSpec = function(opts) {
    if(!this.pipeline() || !this.pipeline().forkName) return;
    if(this.properties.keys.length === 0) return;
    if(opts.item.name != this.groupName()) return;

    var i;
    for(i = 0; i < opts.spec.marks.length; i++) {
      var m = opts.spec.marks[i];
      if(m.from.data == this.pipelineName) delete m.from.data;
    }

    for(i = 0; i < opts.spec.scales.length; i++) {
      var s = opts.spec.scales[i];
      if(s.inheritFromGroup) {
        delete s.domain.from;
        delete s.inheritFromGroup;
      }
    }
  };

  prototype.markPostSpec = function(opts) {
    if(!this.pipeline() || !this.pipeline().forkName) return;
    if(this.properties.keys.length === 0) return;
    if(opts.item.pipelineName != this.pipelineName) return;
    if(opts.item.type == 'group') return;

    var spec = opts.spec;
    if(!spec.from.transform) spec.from.transform = [];
    spec.from.transform = spec.from.transform.concat(this._transforms);
    spec.from['lyra.role'] = 'fork';
    spec.from['lyra.for'] = this.pipelineName;
    if(opts.item.oncePerFork) {
      spec.from.transform.push({
        type: 'filter',
        test: 'index == 0'
      });
    }
  };

  prototype.group = function(layer) {
    var group = layer.marks[this.groupName()];
    if(!group) {
      group = new vde.Vis.marks.Group(this.groupName(), layer.name);
      group.displayName = 'Group By: ' +
          this.properties.keys.map(function(f) { return f.name; }).join(", ");
      group.pipelineName = this.pipelineName;
      group.doLayout(this.properties.layout || facet.layout_horiz); // By default split horizontally
    }

    return group;
  }

  prototype._addToGroup = function(type, item, layer) {
    var group = this.group(layer);

    item.layerName = layer.name;
    item.groupName = this.groupName();
    group[type][item.name] = item;

    // Don't delete scales from their layer because we may want an axis in the layer
    // rather than the group. Instead, when we get the spec gen the scales within the
    // group, we just toss out spec.domain.data for the group, and vega automatically
    // uses the nearest scale.
    if(type != 'scales') delete layer[type][item.name];
    if(type == 'axes') group._axisCount++;
    if(type == 'marks') {
      layer.markOrder.splice(layer.markOrder.indexOf(item.name), 1);
      group.markOrder.push(item.name);
      group._markCount++;
    }

    // Since we're re-arranging things, we need to make sure angular's scope is maintained.
    var scope = vde.iVis.ngScope();
    if(scope.activeVisual == item) {
      window.setTimeout(function() { scope.toggleVisual(item, null, true); }, 100);
    }
  };

  prototype._layer = function(layer) {
    for(var markName in layer.marks) {
      var mark = layer.marks[markName];
      if(mark.type == 'group' && mark.name == this.groupName()) continue;
      if(!mark.pipeline() ||
          (mark.pipeline() && mark.pipeline().name != this.pipeline().name)) continue;

      this._addToGroup('marks', mark, layer);
    }

    for(var axisName in layer.axes) {
      var axis = layer.axes[axisName];
      if(!axis.pipeline() ||
          (axis.pipeline() && axis.pipeline().name != this.pipeline().name)) continue;

      // Let's try to be smart about this. If we're in a layout mode, only pick axis that
      // a user would expect to be replicated.
      var addToGroup = ((this.properties.layout == facet.layout_horiz && axis.properties.type == 'x') ||
          (this.properties.layout == facet.layout_vert && axis.properties.type == 'y'));

      if(addToGroup) this._addToGroup('axes', axis, layer);
    }

    // We want to move any spatial scales from the layer into the group EXCEPT for any
    // scales the group's properties are using.
    var group = layer.marks[this.groupName()] || {};
    var groupScales = vg.keys(group.properties).map(function(p) {
      var prop =  group.properties[p];
      return prop.scale ? prop.scale.name : '';
    });

    for(var scaleName in layer.scales) {
      var scale = layer.scales[scaleName];
      if(!(scale.range() instanceof vde.Vis.Field)) continue;
      if(groupScales.indexOf(scale.name) != -1) continue;
      if(scale.range().name == 'width' || scale.range().name == 'height')
        this._addToGroup('scales', scale, layer);
    }
  };

  return facet;
})();
vde.Vis.transforms.Filter = (function() {
  var filter = function(pipelineName) {
    vde.Vis.Transform.call(this, pipelineName, 'filter', 'Filter', ['test']);

    this.exprFields = [];

    return this;
  };

  filter.prototype = new vde.Vis.Transform();
  var prototype = filter.prototype;

  prototype.spec = function() {
    return {
      type: this.type,
      test: this.properties.test
    };
  };

  prototype.onFork = function() { return false; };

  return filter;
})();

vde.Vis.transforms.Force = (function() {
  var force = function(pipelineName) {
    var self = this;
    vde.Vis.Transform.call(this, pipelineName, 'force', 'Force-Directed Layout');
    this.isVisual = true;

    this.properties = {
      iterations: 500,
      charge: -30,
      linkDistance: 20,
      linkStrength: 1,
      friction: 0.9,
      // theta: 0.8,
      gravity: 0.1
    };

    this.links = {
      data: null,
      source: null,
      target: null,

      shape: 'line',
      tension: 0,

      properties: {
        path: {field: new vde.Vis.Field('path', '')},
        stroke: {value: '#ccc'},
        strokeWidth: {value: 0.5}
      }
    };

    this.input = vg.keys(this.properties);
    this.output = {
      x: new vde.Vis.Field('x', '', 'encoded', pipelineName),
      y: new vde.Vis.Field('y', '', 'encoded', pipelineName),
      weight: new vde.Vis.Field('weight', '', 'linear', pipelineName)
    };

    this.seen = {};

    vde.Vis.callback.register('pipeline.post_spec', this, this.pipelinePostSpec);
    vde.Vis.callback.register('mark.post_spec',  this, this._mark);
    vde.Vis.callback.register('group.post_spec', this, this.groupPostSpec);
    this.linkFields();

    this.fixedPositions = {};
    vde.Vis.addEventListener('mouseover', this, function(e, i) { return self.onMouseOver(e, i); });
    vde.Vis.addEventListener('mouseout', this,  function(e, i) { return self.onMouseOut(e, i); });
    vde.Vis.addEventListener('dblclick', this,  function(e, i) { return self.onDblClick(e, i); });

    return this;
  };

  force.prototype = new vde.Vis.Transform();
  var prototype = force.prototype;

  prototype.destroy = function() {
    vde.Vis.callback.deregister('pipeline.post_spec', this);
    vde.Vis.callback.deregister('mark.post_spec',  this);
    vde.Vis.callback.deregister('group.post_spec', this);

    vde.Vis.removeEventListener('mouseover', this);
    vde.Vis.removeEventListener('mouseout', this);
    vde.Vis.removeEventListener('dblclick', this);
  };

  prototype.spec = function() {
    if(!this.pipeline() || !this.links.data || !this.links.source || !this.links.target) return;
    var spec = vde.Vis.Transform.prototype.spec.call(this);
    spec.links = this.pipelineName + '_edges';
    this.seen = {};
    return spec;
  };

  prototype.pipelinePostSpec = function(opts) {
    var self = this;
    if(!this.pipeline() || !this.links.data || !this.links.source || !this.links.target) return;
    if(opts.item.name != this.pipelineName) return;

    // Weird Vega Bug
    opts.spec[0].values = vde.Vis._data[opts.spec[0].source].values;
    delete opts.spec[0].source;

    // For fixed nodes, we inject a new data source with the positioning information
    // and then zip/copy them over to our pipeline
    var fixed_nodes = vg.keys(this.fixedPositions).map(function(k) { return self.fixedPositions[k]; });
    if(fixed_nodes.length > 0) {
      opts.spec[0].transform.unshift({
        type: 'copy',
        from: 'fixed_nodes.data',
        fields: ['x', 'y', 'fixed']
      });

      opts.spec[0].transform.unshift({
        type: 'zip',
        key: 'index',
        with: opts.item.name + '_fixed_nodes',
        withKey: 'data.index',
        as: 'fixed_nodes',
        default: {data: {}}
      });

      opts.spec.unshift({
        name: opts.item.name + '_fixed_nodes',
        values: fixed_nodes
      });
    }

    // Inject a separate data source for edges
    opts.spec.unshift({
      name: this.links.data,
      values: vde.Vis._data[this.links.data].values
    });

    opts.spec.unshift({
      name: opts.item.name + '_edges',
      source: this.links.data,
      transform: [{type: 'copy', from: 'data', fields: [this.links.source, this.links.target], as: ['source', 'target']}]
    });
  };

  prototype._mark = function(opts) {
    if(!this.pipeline() || !this.links.data || !this.links.source || !this.links.target) return;
    if(!opts.item.pipeline() ||
      (opts.item.pipeline() && opts.item.pipeline().name != this.pipeline().name)) return;
    if(this.seen[opts.item.layerName]) return;

    this.seen[opts.item.layerName] = false;
  };

  prototype.groupPostSpec = function(opts) {
    if(!this.pipeline()) return;
    if(this.seen[opts.item.name] !== false) return;

    var path = {
      type: 'path',
      from: {
        data: this.pipelineName + '_edges',
        transform: [{type: 'link', shape: this.links.shape, tension: this.links.tension}]
      },
      properties: {enter:{}}
    };

    for(var p in this.links.properties) path.properties.enter[p] = vde.Vis.parseProperty(this.links.properties, p);

    opts.spec.marks.unshift(path);

    this.seen[opts.item.name] = true;
  };

  // This is gross.
  prototype.linkFields = function() {
    var self = this, scope = vde.iVis.ngScope();
    var fields = function() { return self.links.data ? vg.keys(vde.Vis._data[self.links.data].values[0]) : []; };

    scope.$watch(function() {
      return self.links.data;
    }, function() { scope.linkFields = fields(); }, true);

  };

  prototype.onMouseOver = function(e, item) {
    var mark = null;
    if(!(mark = item.mark.def.vdeMdl)) return;
    if(mark.pipelineName != this.pipelineName) return;

    var b = vde.iVis.translatedBounds(item, item.bounds),
        coords = vde.iVis.translatedCoords({ x: b.x1, y: b.y1 - 16 }),
        fixed = this.fixedPositions[item.datum.index];

    $('#transform-force-pin').remove();
    $('<div id="transform-force-pin">&nbsp;</div>')
      .addClass(fixed ? 'pinned' : '')
      .css('left', coords.x + 'px')
      .css('top', coords.y + 'px')
      .appendTo('body');
  };

  prototype.onMouseOut = function(e, item) {
    var mark = null;
    if(!(mark = item.mark.def.vdeMdl)) return;
    if(mark.pipelineName != this.pipelineName) return;

    $('#transform-force-pin').remove();
  };

  prototype.onDblClick = function(e, item) {
    var mark = null;
    if(!(mark = item.mark.def.vdeMdl)) return;
    if(mark.pipelineName != this.pipelineName) return;

    var fixed = this.fixedPositions[item.datum.index],
        pin = $('#transform-force-pin');

    if(fixed) delete this.fixedPositions[item.datum.index];
    else
      this.fixedPositions[item.datum.index] = {
        index: item.datum.index,
        x: item.datum.x,
        y: item.datum.y,
        fixed: true
      };

    pin.toggleClass('pinned');
  };

  return force;
})();

vde.Vis.transforms.Formula = (function() {
  var formula = function(pipelineName) {
    vde.Vis.Transform.call(this, pipelineName, 'formula', 'Formula', ['expr', 'field']);

    this.exprFields = [];
    this.output = {
      field: null
    };

    return this;
  };

  formula.prototype = new vde.Vis.Transform();
  var prototype = formula.prototype;

  prototype.spec = function() {
    this.output.field = new vde.Vis.Field(this.properties.field, '', 'ordinal', this.pipelineName);

    return {
      type: this.type,
      field: this.properties.field,
      expr: this.properties.expr
    };
  };

  prototype.bindProperty = function(prop, opts) {
    vde.Vis.Transform.prototype.bindProperty.call(this, prop, opts);
    this.output = [this.properties.field];
  };

  prototype.onFork = function() { return false; };

  return formula;
})();

vde.Vis.transforms.Geo = (function() {
  var geo = function(pipelineName) {
    vde.Vis.Transform.call(this, pipelineName, 'geo', 'Geographic Projection');

    this.isVisual = true;
    this.geoType  = 'Latitude/Longitude';

    this.properties = {
      lat: null,
      lon: null,
      value: null,
      projection: 'mercator',
      center: [0, 0],
      translate: [0, 0],
      scale: 0,
      rotate: 0,
      precision: 0,
      clipAngle: 0
    };

    this.input = vg.keys(this.properties);
    this.output = {
      x: new vde.Vis.Field('x', '', 'encoded', pipelineName),
      y: new vde.Vis.Field('y', '', 'encoded', pipelineName),
      path: new vde.Vis.Field('path', '', 'encoded', pipelineName),
    };

    return this;
  };

  geo.prototype = new vde.Vis.Transform();
  var prototype = geo.prototype;

  prototype.onFork = function() { return false; };

  prototype.spec = function() {
    var spec = vde.Vis.Transform.prototype.spec.call(this),
        props = this.properties;
    spec.type = (this.geoType == 'GeoJSON') ? 'geopath' : 'geo';

    if(this.properties.projection == 'albersUsa') delete spec.center;

    return (props.value || (props.lat && props.lon)) ? spec : null;
  };

  return geo;
})();

vde.Vis.transforms.Pie = (function() {
  var pie = function(pipelineName) {
    vde.Vis.Transform.call(this, pipelineName, 'pie', 'Pie Chart', ['value', 'sort']);

    this.isVisual = true;

    this.output = {
      startAngle: new vde.Vis.Field('startAngle', '', 'encoded', pipelineName),
      endAngle: new vde.Vis.Field('endAngle', '', 'encoded', pipelineName)
    };

    return this;
  };

  pie.prototype = new vde.Vis.Transform();
  var prototype = pie.prototype;

  prototype.spec = function() {
    var spec = {
      type: this.type,
      sort: this.properties.sort
    };

    if(this.properties.value)
      spec.value = this.properties.value.spec();

    return spec;
  };

  prototype.unbindProperty = function(prop) {
    delete this.properties[prop];
  };

  return pie;
})();

vde.Vis.transforms.Sort = (function() {
  var sort = function(pipelineName) {
    vde.Vis.Transform.call(this, pipelineName, 'sort', 'Sort', ['by', 'order']);
    return this;
  };

  sort.prototype = new vde.Vis.Transform();
  var prototype = sort.prototype;

  prototype.spec = function() {
    return {
      type: this.type,
      by: (this.properties.order == 'Descending' ? '-' : '') + this.properties.by.spec().replace('stats.', '')
    };
  };

  return sort;
})();

vde.Vis.transforms.Stack = (function() {
  var stack = function(pipelineName) {
    vde.Vis.Transform.call(this, pipelineName, 'stack', 'Stacked Layout', ['point', 'height', 'offset', 'order']);

    vde.Vis.callback.register('vis.post_spec', this, this.visPostSpec);

    // Defaults
    this.properties.offset = 'zero';
    this.properties.order = 'default';

    this.scale = null;
    this.requiresFork = true;
    this.isVisual = true;

    this.output = {
      y: new vde.Vis.Field('y', '', 'encoded', pipelineName),
      y2: new vde.Vis.Field('y2', '', 'encoded', pipelineName),
    };

    return this;
  };

  stack.prototype = new vde.Vis.Transform();
  var prototype = stack.prototype;

  prototype.destroy = function() {
    vde.Vis.callback.deregister('vis.post_spec', this);
  };

  prototype.spec = function() {
    if(!this.pipeline()) return;
    if(!this.properties.point || !this.properties.height) return;

    // Add a scale for the stacking
    this.scale = this.pipeline().scale({
      domainTypes: {from: 'field'},
      domainField: new vde.Vis.Field('sum', '', 'linear', this.pipeline().name + '_stack'),
      rangeTypes: {type: 'spatial'}
    }, {
      properties: {type: 'linear'},
      rangeTypes: {type: 'spatial', from: 'preset'},
      rangeField: new vde.Vis.Field('height'),
      axisType: 'y'
    }, 'stacks');
    this.scale.used = true;

    return vde.Vis.Transform.prototype.spec.call(this);
  };

  // Inject stats calculation for height scales
  prototype.visPostSpec = function(opts) {
    if(!this.pipeline()) return;

    if(!this.pipeline().forkName) {
      var t = this.pipeline().transforms, thisIdx = null;
      for(var i = 0; i < t.length; i++) {
        if(t[i] == this) { thisIdx = i; break; }
      }

      var facet = new vde.Vis.transforms.Facet();
      facet.pipelineName = this.pipelineName;
      facet.properties.layout = 'Overlap';
      this.pipeline().transforms.splice(thisIdx, 0, facet);

      vde.Vis.render();
    }

    if(!this.properties.point || !this.properties.height) return;

    opts.spec.data.push({
      name: this.pipeline().name + '_stack',
      source: this.pipeline().source,
      transform: [
        {type: 'facet', keys: [this.properties.point.spec()]},
        {type: 'stats', value: this.properties.height.spec()}
      ]
    });
  };

  return stack;
})();

vde.Vis.transforms.Stats = (function() {
  var stats = function(pipelineName) {
    vde.Vis.Transform.call(this, pipelineName, 'stats', 'Stats', ['value', 'median', 'output']);

    this.requiresFork = true;
    this.fields = [];

    return this;
  };

  stats.prototype = new vde.Vis.Transform();
  var prototype = stats.prototype;
  var fields = ["count", "min", "max", "sum", "mean", "variance", "stdev", "median"];

  prototype.spec = function() {
    if(!this.properties.field) return;
    this.properties.value = this.properties.field.spec()
    var self = this, value = this.properties.value.split('.'),
        output = {};
    this.fields = [];

    fields.forEach(function(s) {
      output[s] = s+'_'+value[value.length-1];
      self.fields.push(output[s]);
    });

    return {
      type: 'stats',
      value: this.properties.field.spec(),
      median: this.properties.median,
      assign: true,
      output: output
    };
  };

  return stats;
})();

vde.Vis.transforms.Window = (function() {
  var win = function(pipelineName) {
    vde.Vis.Transform.call(this, pipelineName, 'window', 'Window', ['size', 'step']);

    this.requiresFork = true;

    vde.Vis.callback.register('group.post_spec', this, this.groupPostSpec);

    return this;
  };

  win.prototype = new vde.Vis.Transform();
  var prototype = win.prototype;

  prototype.destroy = function() {
    vde.Vis.callback.deregister('group.post_spec',  this);
  };

  prototype.spec = function() { return null; };

  prototype.groupPostSpec = function(opts) {
    if(!this.properties.size || !this.properties.step) return;
    if(opts.item.pipelineName != this.pipelineName) return;
    if(opts.item.isLayer()) return;

    var marks = vg.duplicate(opts.spec.marks);

    opts.spec.marks = [{
      type: 'group',
      name: opts.item.name + '_window',
      from: {
        transform: [{
          type: 'window',
          size: this.properties.size,
          step: this.properties.step
        }]
      },
      marks: marks
    }];
  };

  return win;
})();
