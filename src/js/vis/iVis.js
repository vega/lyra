vde.iVis = (function() {
  var ivis = {
    view: null,
    dragging: null,
    _data: {}, _marks: [], _evtHandlers: {},
    activeMark: null,
    activeItem: null
  };

  var events = [
    "mousemove", "mousedown", "mouseup", "mouseover", "mouseout",
    "click", "dblclick", "keypress", "keydown", "keyup"
  ];

  ivis.interactor = function(interactor, data, evtHandlers) {
    if(!interactor || !data) return;
    this._data[interactor + '_data'] = data;
    this._marks.push(this[interactor]());

    for(var type in evtHandlers) this._evtHandlers[type] = evtHandlers[type];
  };

  ivis.parse = function() {
    var spec = {
      width: vde.Vis.properties.width,
      height: vde.Vis.properties.height,
      padding: vde.Vis.properties.padding,
      data: [], scales: [], marks: []
    };

    if((this._data.length == 0 || this._marks.length == 0) && 
        this.activeMark && this.activeMark.interactive) {
      var active = this.activeMark.interactive();
      this.interactor(active[0], active[1], active[2]);
    }

    spec.marks = this._marks;        
    spec.scales.push({
      name: 'disabled',
      domain: [0, 1],
      range: ['#fff', '#999']
    });
    for(var d in this._data)
      spec.data.push({ name: d, values: this._data[d] });

    vg.parse.spec(spec, function(chart) {
      d3.select('#ivis').selectAll('*').remove();
      (vde.iVis.view = chart({ el: '#ivis' })).update();

      var icanvas = d3.select('#ivis canvas');

      // We have event handlers registered on both #vis and #ivis
      // so transmit interactions on ivis (on top) to #vis (bottom).
      var dispatchEvent = function() {
        var e = d3.event;
        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent(e.type, true, true, window,
          0, e.screenX, e.screenY, e.clientX, e.clientY, 
          false, false, false, false, 0, null);
        d3.select('#vis canvas').node().dispatchEvent(evt);
      };

      events.forEach(function(type) {
        if(type == 'mousemove') {
          icanvas.on('mousemove', function() {
            dispatchEvent();
            if(ivis._evtHandlers[type]) ivis._evtHandlers[type]();
          })
        } else if(type.indexOf('key') != -1) {
          if(ivis._evtHandlers[type])
            d3.select('body').on(type, ivis._evtHandlers[type]);
        } else {
          icanvas.on(type, dispatchEvent);
          if(ivis._evtHandlers[type])
            ivis._evtHandlers[type]();
        }
      });

      // For handles, automatically register a mousedown/up event to enable
      // dragging
      if(spec.marks.length > 0 && spec.marks[0].name == 'handle') {
        var mouseup = function() { vde.iVis.dragging = null; icanvas.style('cursor', 'auto'); };

        vde.iVis.view
          .on('mouseover', function(e, i) {
            if(i.datum.data.cursor && !i.datum.data.disabled) icanvas.style('cursor', i.datum.data.cursor);
          })
          .on('mouseout', function() { if(!vde.iVis.dragging) mouseup(); })
          .on('mousedown', function(e, i) {
            vde.iVis.dragging = {item: i, prev: [e.pageX, e.pageY]};
            if(i.datum.data.cursor && !i.datum.data.disabled) icanvas.style('cursor', i.datum.data.cursor); 
          })
          .on('mouseup', mouseup);

        icanvas.on('mouseup', mouseup);
      }

      ivis._data = {}, ivis._marks = [];
    });     

    return spec;
  };

  ivis.handle = function() {
    return {
      name: 'handle',
      type: 'symbol',
      from: {data: 'handle_data'},
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
          y: {field: 'data.y'}
        }
      }
    }
  };

  ivis.connector = function() {
    return {
      name: 'connector',
      type: 'symbol',
      from: {data: 'connector_data'},
      properties: {
        enter: {
          shape: {value: 'circle'},
          size: {value: 40},
          fill: {value: 'cyan'},
          stroke: {value: 'cyan'},
          strokeWidth: {value: 0.5}
        },
        update: {
          x: {field: 'data.x'},
          y: {field: 'data.y'},
        }
      }
    };
  };

  ivis.span = function() {
    return {
      name: 'span_group',
      type: 'group',
      from: {
        data: 'span_data',
        transform: [{type: 'facet', keys:['data.span']}]
      },
      marks: [{
        name: 'span',
        type: 'line',
        properties: {
          enter: {
            stroke: {value: 'cyan'},
            strokeWidth: {value: 1}
          },
          update: {
            x: {field: 'data.x'},
            y: {field: 'data.y'}
          }
        }
      }]
    }
  };

  // From vg.canvas.Renderer
  ivis.translatedBounds = function(item, bounds) {
    var b = new vg.Bounds(bounds);
    while ((item = item.mark.group) != null) {
      b.translate(item.x || 0, item.y || 0);
    }
    return b;
  };

  return ivis;
})();