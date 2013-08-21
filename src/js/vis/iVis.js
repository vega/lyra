vde.iVis = (function() {
  var ivis = {
    view: null,
    dragging: null,
    timeout: null,
    _data: {}, _marks: [], _evtHandlers: {},
    activeMark: null,
    activeItem: null
  };

  var events = [
    "mousemove", "mousedown", "mouseup", "mouseover", "mouseout",
    "click", "dblclick", "keypress", "keydown", "keyup"
  ];

  var interactors = ['handle', 'connector', 'point', 'span', 'dropzone'];

  ivis.interactor = function(interactor, data, evtHandlers) {
    if(!interactor || !data) return;

    this._data[interactor] = data;
    for(var type in evtHandlers) this._evtHandlers[type] = evtHandlers[type];
  };

  ivis.show = function(show) {
    if(!vg.isArray(show)) show = [show];
    if(this.activeMark) this.activeMark.selected();

    var d = {};
    interactors.forEach(function(i) { d[i] = []; });
    show.forEach(function(s) { if(ivis._data[s]) d[s] = ivis._data[s]; });

    ivis.view.data(d).update();
  };

  // We can't keep re-parsing the iVis layer. This triggers false mouseout
  // events as a result of removing all #ivis children. So, we only reparse
  // when we reparse the Vis, and subsequently only update the datasets.
  ivis.parse = function() {
    var spec = {
      width: vde.Vis.properties.width,
      height: vde.Vis.properties.height,
      padding: vde.Vis.properties.padding
    };

    spec.data = interactors.map(function(i) { return {name: i, values: [] }});
    spec.scales = [{
      name: 'disabled',
      domain: [0, 1],
      range: ['#fff', '#999']
    }];
    spec.marks = interactors.map(function(i) { return ivis[i](); });

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
          icanvas.on(type, function(){
            if(type == 'mouseup') mouseup();
            dispatchEvent();
          });

          vde.iVis.view.on(type, function(e, i) {
            if(ivis._evtHandlers[type]) ivis._evtHandlers[type](e, i);

            var cursor = function() {
              if(i.mark.def.name == 'handle' && i.datum.data &&
                  i.datum.data.cursor && !i.datum.data.disabled)
                icanvas.style('cursor', i.datum.data.cursor);
            };

            // Automatically register events to handle dragging
            switch(type) {
              case 'mouseover': cursor(); break;
              case 'mouseout': if(!vde.iVis.dragging) mouseup(); break;
              case 'mousedown':
                vde.iVis.dragging = {item: i, prev: [e.pageX, e.pageY]};
                cursor();
              break;
              case 'mouseup': mouseup(); break;
            }
          });
        }
      });

      ivis.show('handle');
    });

    return spec;
  };

  ivis.handle = function() {
    return {
      name: 'handle',
      type: 'symbol',
      from: {data: 'handle'},
      properties: {
        enter: {
          shape: {value: 'square'},
          size: {value: 40},
          fill: {scale: 'disabled', field: 'data.disabled'},
          stroke: {value: 'black'},
          strokeWidth: {value: 0.5}
        },
        update: {
          x: {field: 'data.x'},
          y: {field: 'data.y'},
          connector: {field: 'data.connector'}
        }
      }
    }
  };

  ivis.connector = function() {
    return {
      name: 'connector',
      type: 'symbol',
      from: {data: 'connector'},
      properties: {
        enter: {
          shape: {value: 'diamond'},
          size: {value: 40},
          fill: {value: 'white'}
        },
        update: {
          x: {field: 'data.x'},
          y: {field: 'data.y'},
          stroke: {value: 'magenta'},
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
          size: {value: 40},
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
          fillOpacity: {value: 0},
          // stroke: {value: 'black'},
          // strokeDash: {value: [0.3, 1]}
        },
        update: {
          x: {field: 'data.x'},
          y: {field: 'data.y'},
          x2: {field: 'data.x2'},
          y2: {field: 'data.y2'},
          property: {field: 'data.property'},
          connector: {field: 'data.connector'}
        }
      }
    }
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

    $('.proxy').remove();
    ivis.dragging = null;

    vde.Vis.parse();

    return [scale, field];
  };

  // From vg.canvas.Renderer
  ivis.translatedBounds = function(item, bounds) {
    var b = new vg.Bounds(bounds);
    while ((item = item.mark.group) != null) {
      b.translate(item.x || 0, item.y || 0);
    }
    return b;
  };

  ivis.ngScope = function() {
    return angular.element($('body')).scope();
  };

  return ivis;
})();
