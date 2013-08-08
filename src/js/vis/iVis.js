vde.iVis = (function() {
  var ivis = {
    view: null,
    dragging: null
  };

  var events = [
    "mousemove", "mousedown", "mouseup", "mouseover", "mouseout",
    "click", "dblclick"
  ];

  ivis.interactor = function(interactor, data, evtHandlers) {
    var spec = {
      width: vde.Vis.properties.width,
      height: vde.Vis.properties.height,
      padding: vde.Vis.properties.padding,
      data: [], scales: [], marks: []
    };

    spec.data.push({ name: interactor + '_data', values: data });
    spec.marks.push(ivis[interactor]());

    vg.parse.spec(spec, function(chart) {
      d3.select('#ivis').selectAll('*').remove();
      (vde.iVis.view = chart({ el: '#ivis', renderer: 'svg' })).update();

      var canvas = d3.select('#vis canvas'), svg = d3.select('#ivis svg');

      // We have event handlers registered on both #vis and #ivis
      // so transmit interactions on ivis (on top) to #vis (bottom).
      var dispatchEvent = function() {
        var e = d3.event;
        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent(e.type, true, true, window,
          0, e.screenX, e.screenY, e.clientX, e.clientY, 
          false, false, false, false, 0, null);
        canvas.node().dispatchEvent(evt);
      };

      events.forEach(function(type) {
        svg.on(type, dispatchEvent);

        if(type == 'mousemove') svg.on('mousemove', evtHandlers[type] || new Function())
        else vde.iVis.view.on(type, evtHandlers[type] || new Function());
      });

      // For handles, automatically register a mousedown/up event to enable
      // dragging
      if(interactor == 'handle') {
        var mouseup = function() { vde.iVis.dragging = null; svg.style('cursor', 'auto'); };

        vde.iVis.view
          .on('mouseover', function(e, i) {
            if(i.datum.data.cursor) svg.style('cursor', i.datum.data.cursor);
          })
          .on('mouseout', function() { if(!vde.iVis.dragging) mouseup(); })
          .on('mousedown', function(e, i) {
            vde.iVis.dragging = {item: i, prev: [e.pageX, e.pageY]};
            if(i.datum.data.cursor) svg.style('cursor', i.datum.data.cursor); 
          })
          .on('mouseup', mouseup);

        svg.on('mouseup', mouseup);
      }
           
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
          fill: {value: 'white'},
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

$(document).ready(function() {
  // Prevent text selection cursor
  document.onselectstart = function() { return false; }
})