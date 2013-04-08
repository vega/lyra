vde.ui = {dragging:null};

vde.ui.init = function() {
    // Initialize each primitive's specific UI (e.g. inspectors)
    var rect = new vde.primitives.marks.Rect();
    rect.initUI();

    var arc = new vde.primitives.marks.Arc();
    arc.initUI();
};

vde.ui.addPrimitiveToolbar = function(primitive) {
    d3.select('#primitives ul').append('li')
        .classed(primitive.getType(), true)
        .text(primitive.getType())
        .attr('draggable', 'true')
        .on('dragstart', function() {
            d3.event.dataTransfer.effectAllowed = 'copy';
            d3.event.dataTransfer.setData('vde.primitive', primitive.getClass(true));
            return primitive.onToolbarDragStart(d3.event);
        })
        .on('dragend', function() { return primitive.onToolbarDragEnd(d3.event); });
};

vde.ui.addDataToolbar = function(src) {
    var toolbar = d3.select('#data');
    var srcList = toolbar.selectAll('select').data([1]);

    srcList.enter().append('select')
        .on('change', function() {
            toolbar.selectAll('.capsule').style('display', 'none');
            toolbar.selectAll('.datasrc-' + this.value).style('display', 'inline-block');
        })
        .append('option')
            .attr('value', '')
            .text('Data Sources');

    var dragstart = function(src, field, idx) {
        d3.selectAll('.inspector .field').style('border', '1px dashed #666');
        d3.event.dataTransfer.effectAllowed = 'copy';
        d3.event.dataTransfer.setData('vde.capsule', JSON.stringify({src: src, field: field, index: idx}));
        return false;
    };

    var dragend = function(idx) {
        d3.selectAll('.inspector .field').style('border', '1px dashed transparent');
    };

    srcList.append('option')
        .attr('value', src)
        .text(src);

    var indexCapsule = new vde.ui.Capsule(src, 'index', true).build(toolbar);
    indexCapsule.el.attr('draggable', 'true')
        .on('dragstart', function() {
            return dragstart(src, 'index', true);
        })
        .on('dragend', dragend);

    Object.keys(vde.data[src].values[0]).forEach(function(field) {
        var p = new vde.ui.Capsule(src, field).build(toolbar);
        p.el.attr('draggable', 'true')
            .on('dragstart', function() {
                return dragstart(src, field);
            })
            .on('dragend', dragend);
    });

    toolbar.selectAll('.capsule').style('display', 'none');
    toolbar
        .on('mouseover', function() { d3.select(this).style('height', this.scrollHeight + 'px'); })
        .on('mouseout',  function() { d3.select(this).style('height', '32px'); })

    return this;    
};

vde.ui.toolTip = function(on, x, y, tooltip) {
    if(on) {
        var tip = d3.select('body').selectAll('div#tooltip').data([1]);
        tip.enter()
            .append('div')
                .attr('id', 'tooltip')

        tip.style('left', x + 'px')
            .style('top', y + 'px')
            .html(tooltip);
    } else {
        d3.select('div#tooltip').remove();
    }
};

vde.ui.render = function(chart) {
    d3.select('#vis').selectAll('*').remove();
    (vde.view = chart({ el: '#vis' })).update();

    vde.ui.regEvtHandlers();
};

vde.ui.export = function() {
    var overlay = d3.select('body').selectAll('#overlay').data([1]);
    overlay.enter()
        .append('div')
            .attr('id', 'overlay')
            .style('opacity', '0')
            .on('click', function() {
                d3.select('#export').style('display', 'none');
                overlay.remove();
            });

    overlay.transition()
        .duration(250)
        .style('opacity', '0.6');    

    d3.select('#export')
        .text(JSON.stringify(vde.parse(), null, 2))
        .style('display', 'block');
};

vde.ui.cancelDrag = function() { d3.event.preventDefault(); return false; };

vde.ui.regEvtHandlers = function() {
    var self = this;

    d3.select('#vis')
        .on('dragenter', vde.ui.cancelDrag)
        .on('dragover', vde.ui.cancelDrag)
        .on('drop', function() {
            var pClass = d3.event.dataTransfer.getData('vde.primitive');
            if(!pClass)
                return false;

            var primitive = eval('new ' + pClass + '("primitive_' + Date.now() + '")');
            primitive.onToolbarDrop(d3.event);

            vde.parse();
        });

    // Go up the path until you can get to the mark
    var getMarkFromView = function(obj, type) {
        if(obj.mark.marktype == type)
            return obj;
        else if(obj.mark.group)
            return getMarkFromView(obj.mark.group, type)

        return null;
    };

    // Get the "panel" group
    var getPanelFromView = function(obj) {
        // Panels exist within a top-level group, 
        // but these groups aren't named
        if(obj.mark.group && obj.mark.group.mark.def.name)
            return getPanelFromView(obj.mark.group);

        return obj;
    }

    var primitiveFromView = function(obj) {
        if(obj.mark.marktype == 'group')
            return vde.groups[obj.mark.def.name];
        else 
            return vde.groups[obj.mark.group.mark.def.name].marks[obj.mark.def.name];
    }

    vde.view
        .on('mouseover', function(e, i) {
            // Outline the group container
            var group = getPanelFromView(i);
            if(!group.stroke || group.strokeWidth < 1) {
                group.stroke = '#ccc';
                group.strokeWidth = '1';
                group.vdeStroke = true;
                vde.view.render();
            }  

            var primitive = primitiveFromView(i);
            return primitive.onViewMouseOver(e, i);
        })
        .on('mouseout', function(e, i) {
            // Remove group container outline
            var group = getPanelFromView(i);
            if(group.vdeStroke) {
                group.strokeWidth = '0';
                vde.view.render();
            }  

            var primitive = primitiveFromView(i);
            return primitive.onViewMouseOut(e, i);      
        })
        .on('mousedown', function(e, i) {
            var primitive = primitiveFromView(i);
            vde.ui.dragging = {
                el: primitive.spec.name,
                old: vde.ui.mouse(d3.select('#vis').node(), e),
                sceneObj: i,
                target: primitive,
                onmousemove: primitive.onViewMouseMove,
                onmouseup: primitive.onViewMouseUp
            };

            return primitive.onViewMouseDown(e, i);
        })
        .on('mouseup', function(e, i) {
            var primitive = primitiveFromView(i);
            primitive.onViewMouseUp(e, i);

            vde.ui.onMouseUp(e);

            vde.ui.dragging = null;
            return false;
        })        
        .on('mousemove', function(e, i) {
            var primitive = primitiveFromView(i);
            vde.ui.onMouseMove(e);

            return primitive.onViewMouseMove(e, i);
        })
        .on('click', function(e, i) {
            var mark = i.mark;
            var primitive = primitiveFromView(i);

            vde.ui.inspector.show(primitive, [e.pageX, e.pageY]);
        });

    // When we begin a drag on a scene graph object, if the mouse
    // cursor travels fast and escapes the target, have these global
    // listeners to catch those events and transmit them back. 
    d3.select('body')
        .on('mousemove', vde.ui.onMouseMove)
        .on('mouseup', vde.ui.onMouseUp);
};

vde.ui.onMouseMove = function(e) {
    if(!vde.ui.dragging)
        return;

    var d = vde.ui.dragging;
    if(d.onmousemove)
        d.onmousemove.call(d.target, (d3.event || e), d.sceneObj);    
};

vde.ui.onMouseUp = function(e) {
    if(!vde.ui.dragging)
        return;

    var d = vde.ui.dragging;
    if(d.onmouseup)
        d.onmouseup.call(d.target, (d3.event || e), d.sceneObj);

    vde.ui.dragging = null;
    return false;
};

// Hacky, copied from d3 so we can feed it non d3.events
vde.ui.d3_mouse_bug44083 = /WebKit/.test(window.navigator.userAgent) ? -1 : 0;
vde.ui.mouse = function(container, e) {
  var svg = container.ownerSVGElement || container;
  if (svg.createSVGPoint) {
    var point = svg.createSVGPoint();
    if (vde.ui.d3_mouse_bug44083 < 0 && (window.scrollX || window.scrollY)) {
      svg = d3.select(d3_document.body).append("svg").style("position", "absolute").style("top", 0).style("left", 0);
      var ctm = svg[0][0].getScreenCTM();
      d3_mouse_bug44083 = !(ctm.f || ctm.e);
      svg.remove();
    }
    if (d3_mouse_bug44083) {
      point.x = e.pageX;
      point.y = e.pageY;
    } else {
      point.x = e.clientX;
      point.y = e.clientY;
    }
    point = point.matrixTransform(container.getScreenCTM().inverse());
    return [ point.x, point.y ];
  }
  var rect = container.getBoundingClientRect();
  return [ e.clientX - rect.left - container.clientLeft, e.clientY - rect.top - container.clientTop ];
};