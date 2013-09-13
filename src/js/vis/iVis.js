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

  var interactors = ['handle', 'connector', 'connection', 'point', 'span', 'dropzone'];

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
  ivis.parse = function(scale) {
    var spec = {
      width: vde.Vis.view._width,
      height: vde.Vis.view._height,
      padding: vde.Vis.view._padding
    };

    spec.data = interactors.map(function(i) { return {name: i, values: [] }});
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
          })
        } else if(type.indexOf('key') != -1) {
          d3.select('body').on(type, function() {
            if(ivis._evtHandlers[type]) ivis._evtHandlers[type]();
          });
        } else {
          icanvas.on(type, dispatchEvent);

          vde.iVis.view.on(type, function(e, item) {
            if(ivis._evtHandlers[type]) ivis._evtHandlers[type](e, item);

            var cursor = function() {
              if(item.mark.def.name == 'handle' && item.datum.data &&
                  item.datum.data.cursor && !item.datum.data.disabled)
                icanvas.style('cursor', item.datum.data.cursor);
            };

            var items = function() {  // We need to make this more reliable.
              var items = [];

              if(item.mark.group.items[1].items.length > 0)   // Connectors
                items.push(item.mark.group.items[1].items[item.key]);

              if(item.mark.group.items[3].items.length > 0) { // Points
                // We need to offset by the number of spans
                var spans = item.mark.group.items[4].items.length;
                items.push(item.mark.group.items[3].items[item.key-spans]);
              }

              return items;
            };

            // Automatically register events to handle dragging
            switch(type) {
              case 'mouseover':
                cursor();

                if(ivis.dragging && item.mark.def.name == 'dropzone') {
                  // On mouseover, highlight the underlying span/connector.
                  if(item.connector)
                    ivis.view.update({
                      props: 'hover',
                      items: items()
                    });
                  else
                    ivis.view.update({
                      props: 'hover',
                      items: item.cousin(-1).items[0].items
                    });

                  if(item.property) {
                    d3.selectAll('#' + item.property + '.property').classed('drophover', true);
                    ivis.tooltip(e, item, item.property);
                  }
                }
              break;

              case 'mouseout':
                if(ivis.dragging && item.mark.def.name == 'dropzone') {
                  // Clear highlights
                  if(item.connector)
                    ivis.view.update({
                      props: 'update',
                      items: items()
                    });
                  else
                    ivis.view.update({
                      props: 'update',
                      items: item.cousin(-1).items[0].items
                    });

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

                mouseup();
              break;
            }
          });
        }
      });

      if(!scale) ivis.show('selected');
    });

    return spec;
  };

  ivis.bindProperty = function(visual, property, defaults) {
    if(!ivis.dragging) return;

    var rootScope = ivis.ngScope();
    var field = $(ivis.dragging).data('field') || $(ivis.dragging).find('.schema').data('field') || $(ivis.dragging).find('.schema').attr('field');
    var scale = $(ivis.dragging).find('.scale').attr('scale');
    var pipelineName = rootScope.activePipeline.name;

    if(visual.pipelineName && pipelineName != visual.pipelineName)
      return alert('Pipelines don\'t match');

    rootScope.$apply(function() {
      if(!visual.pipelineName && !(visual instanceof vde.Vis.Transform)) visual.pipelineName = pipelineName;

      visual.bindProperty(property,
        {field: field, scaleName: scale, pipelineName: pipelineName}, defaults);
    });

    vde.Vis.parse();

    window.setTimeout(function() {
      $('.proxy').remove();
      ivis.dragging = null;

      ivis.ngLogger().log('bind', {
        item: visual.name,
        group: visual.groupName,
        activePipeline: rootScope.activePipeline.name,
        itemPipeline: visual.pipelineName,
        property: property,
        scaleName: scale,
        field: field
      }, true, true);

      if(visual.groupName) rootScope.$apply(function() { rootScope.toggleVisual(visual); });
    }, 1);

    window.clearTimeout(vde.iVis.timeout);
  };

  ivis.addMark = function(host, connector) {
    var mark = ivis.newMark,
        rootScope = ivis.ngScope();

    // If they've dropped on an empty non-group space.
    if(!host) host = rootScope.activeGroup;

    if(host instanceof vde.Vis.marks.Group) mark.groupName = host.name;
    else if(host.connectors[connector]) {
      mark.groupName    = host.groupName;
      mark.connectedTo  = {host: host, connector: connector};
    }

    mark.pipelineName = (rootScope.activePipeline||{}).name;

    rootScope.$apply(function() {
      mark.init();
      vde.Vis.parse();
    });

    window.setTimeout(function() {
      ivis.newMark = null;
      $('.proxy').remove();

      ivis.ngLogger().log('new_mark', {
        markType: mark.type,
        markName: mark.name,
        activeGroup: (rootScope.activeGroup || {}).name,
        markGroup: mark.groupName
      }, true);

      rootScope.$apply(function() { rootScope.toggleVisual(mark); });
    }, 1);

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
    }
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
    }
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
    }
  };

  ivis.point = function() {
    return {
      name: 'point',
      type: 'symbol',
      from: {data: 'point'},
      properties: {
        enter: {
          shape: {value: 'circle'},
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
            strokeWidth: {value: 1},
            span: {field: 'data.span'}
          },
          hover: {
            stroke: {value: 'lightsalmon'},
            strokeWidth: {value: 3}
          }
        }
      }]
    }
  };

  ivis.dropzone = function() {
    return {
      name: 'dropzone',
      type: 'rect',
      from: {data: 'dropzone'},
      properties: {
        enter: {
          fillOpacity: {value: 0.1},
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
          layout: {field: 'data.layout'}
        },
        hover: {
          fill: {value: 'lightsalmon'}
        }
      }
    }
  };

  ivis.scale = function(scale, spec) {
    var props = scale.properties, pipeline = scale.pipeline();
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
      spec.axes || (spec.axes = []);
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

  ivis.tooltip = function(evt, dropzone, property) {
    var tooltip = $('<div class="tooltip fade in">' +
      '<div class="tooltip-arrow"></div>' +
      '<div class="tooltip-inner">' + property + '</div></div>');
    $('body').append(tooltip);
    var b = ivis.translatedBounds(dropzone, dropzone.bounds);

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
    while ((item = item.mark.group) != null) {
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
    return $('html').injector().get('$rootScope')
  };

  ivis.ngLogger = function() {
    return $('html').injector().get('logger');
  };

  ivis.ngFilter = function() {
    return $('html').injector().get('$filter');
  }

  return ivis;
})();
