var fullData;
var panels = [];

$(document).ready(function(){
    loadData();        
    loadPrimitives();
});

function loadData() {
    $.getJSON("./data/olympics.json", function(response) {
        fullData = response;
        // assuming first row is column names
        for(var label in fullData[0]) {
            var li = $('<li></li>')
                .addClass('data-col')
                .text(label);

            $("#ui-data ul").append(li);
        }

        // Make the data columns draggable
        $('.data-col').draggable({ 
            helper: "clone",
            opacity: 0.9,
            zIndex: 1000,
            cursor: 'imgs/closedhand.cur',
            start: function( event, ui ) {
                // Make the helper more visually salient
                ui.helper
                    .css('background', '#ccc')
                    .css('font-size', '10px')
                    .css('padding', '3px')
                    .css('cursor', 'url(imgs/closedhand.cur), default');

                $('.delegate').addClass('delegate-droppable');
            },
            stop: function( event, ui ) {
                $('.delegate').removeClass('delegate-droppable');
            }
        });
    });
}

function loadPrimitives() {
    for(var id in primitives) {
        var li = $('<li></li>')
            .addClass('primitive')
            .addClass('primitive_' + id)
            .attr('id', 'primitive_' + id)
            .text(id);            

        $('#ui-primitives ul').append(li);
    }

    // Primitives should be draggable and droppable onto
    // #ui-new-panel or any other primitive's particular anchor
    $('#ui-primitives li').draggable({
        helper: 'clone',
        opacity: 0.9,
        zIndex: 1000,
        start: function(event, ui) {
            ui.helper
                .css('backgroundColor', '#ddd')
                .css('borderColor', '#ddd');
        }
    });

    $('#ui-new-panel').droppable({
        accept: '#ui-primitives li',
        activeClass: 'ui-valid-target',
        hoverClass: 'ui-valid-target-hover',     
        drop: function(event, ui) {
            var primitiveId = ui.helper.text().replace('primitive_', '');           
            var primitive = jQuery.extend(true, {}, primitives[primitiveId]);
            var panelId = newPanel();
            addPrimitive(primitive, panelId);
        }   
    });

    // Primitives can also be droppable, accepting any data column
    // to automatically create a new panel.
    $('#ui-primitives li').droppable({
        accept: '.data-col',
        activeClass: 'ui-valid-target',
        hoverClass: 'ui-valid-target-hover',
        drop: function(event, ui) {
            var primitiveId = $(this).attr('id').replace('primitive_', '');
            var primitive = jQuery.extend(true, {}, primitives[primitiveId]);
            var panelId = newPanel();

            primitive = setMapping(primitive, primitive.defaultDataMapping, ui.helper.text());

            addPrimitive(primitive, panelId);
        }
    });
}

function newPanel() {
    var panelId = panels.length;
    var panel = $('<div></div>')
        .addClass('vis-panel')
        .attr('id', 'vis-panel_' + panelId);

    $('#ui-new-panel').before(panel);

    $('#ui-vis svg').hide();
    var stage = d3.select('#ui-vis')
        .append('svg:svg')
            .attr('class', 'vis-stage')
            .attr('id', 'vis-stage_' + panelId);

    panels.push({});

    return panelId;
}

function addPrimitive(primitive, panelId) {
    var panel = panels[panelId];
    var primitiveId = primitive.type + '_' + panelId + '_' + $(panel).length;

    var delegate = $('<div></div>')
        .addClass('delegate')
        .addClass('delegate-preview')
        .attr('id', primitiveId)
        .css('top', '15px')
        .css('left', '75px')
        .css('width', primitive.delegate.width   + 'px')
        .css('height', primitive.delegate.height + 'px')
        .html(primitive.delegate.html);

    for(var dzId in primitive.dropzones) {
        var dzNode = buildDropZone(panelId, primitiveId, primitive, dzId);
        delegate.append(dzNode);
    }

    $('#vis-panel_' + panelId).append(delegate);

    primitive.id = primitiveId;
    panels[panelId][primitiveId] = primitive;

    // When a primitive is added, show all of its dropzones 
    // initially and then fade out to cue user.
    window.setTimeout(function() {
        delegate.children('.dropzone').fadeOut(500, function() {
            delegate.removeClass('delegate-preview');
        }); 
        delegate.animate({ borderColor: '#fff'}, 500);
    }, 1500);
    

    primitive.visualization(panelId);
}

function buildDropZone(panelId, primitiveId, primitive, dzId) {
    var dz = primitive.dropzones[dzId];

    var dzNode = $('<div></div>')
        .addClass('dropzone')
        .attr('panelId', panelId)
        .attr('primitiveId', primitiveId)
        .attr('dzId', dzId)
        .css('left',   dz.x + 'px')
        .css('top',    dz.y + 'px')
        .css('width',  dz.width + 'px')
        .css('height', dz.height + 'px');

    var dzLbl = $('<h3></h3>')
        .text(dz.label.text)
        .css('marginLeft', dz.label.x + 'px')
        .css('marginTop',  dz.label.y + 'px');

    dzNode.append(dzLbl);
    dzNode.droppable({
        accept: '.data-col',
        activeClass: 'ui-valid-target',
        hoverClass: 'ui-valid-target-hover',
        tolerance: 'touch',
        over: function(event, ui) {
            panelId = $(this).attr('panelId');
            primitiveId = $(this).attr('primitiveId');
            dzId = $(this).attr('dzId');

            var p = jQuery.extend(true, {}, panels[panelId][primitiveId]);
            p = setMapping(p, dzId, ui.helper.text());
            p.visualization(panelId, 1);
        },
        out: function(event, ui) {
            panelId = $(this).attr('panelId');
            primitiveId = $(this).attr('primitiveId');

            var p = panels[panelId][primitiveId];
            p.visualization(panelId);
        },
        drop: function(event, ui) {
            panelId = $(this).attr('panelId');
            primitiveId = $(this).attr('primitiveId');
            dzId = $(this).attr('dzId');

            var p = panels[panelId][primitiveId];
            p = setMapping(p, dzId, ui.helper.text());
            p.visualization(panelId);
        }
    });

    return dzNode;
}