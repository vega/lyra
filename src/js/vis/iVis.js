vde.iVis = (function() {
  var ivis = {
    view: null,
    dragging: null,
    _data: [], _marks: [], _evtHandlers: {},
    activeMark: null,
    activeItem: null
  };

  var events = [
    "mousemove", "mousedown", "mouseup", "mouseover", "mouseout",
    "click", "dblclick"
  ];

  ivis.interactor = function(interactor, data, evtHandlers) {
    if(!interactor || !data) return;

    this._data = [{ name: interactor + '_data', values: data }]
    this._marks = [this[interactor]()];
    this._evtHandlers = evtHandlers || {};
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
    
    spec.data  = this._data;
    spec.marks = this._marks;        
    spec.scales.push({
      name: 'disabled',
      domain: [0, 1],
      range: ['#fff', '#999']
    });

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
        } else {
          icanvas.on(type, dispatchEvent);
          vde.iVis.view.on(type, ivis._evtHandlers[type] || new Function());
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

      ivis._data = [], ivis._marks = [];
    });     
  };

  ivis.handle = function() {
    return {
      name: 'handle',
      type: 'rect',
      from: {data: 'handle_data'},
      properties: {
        enter: {
          width: {value: 6},
          height: {value: 6},
          fill: {scale: 'disabled', field: 'data.disabled'},
          stroke: {value: 'black'},
          strokeWidth: {value: 0.5}
        },
        update: {
          x: {field: 'data.x', offset: -3},
          y: {field: 'data.y', offset: -3},
        }
      }
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