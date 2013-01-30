var fullData;
var panels = [];
var resizing;

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
        var p = primitives[id];

        var li = $('<li></li>')
            .addClass('primitive')
            .addClass('primitive_' + id)
            .addClass('primitive-' + p.type)
            .attr('id', 'primitive_' + id)
            .attr('primitive_id', id)
            .text(id);  

        if(p.hasOwnProperty('anchors_to'))
            $.each(p.anchors_to, function(i, anchorType) {
                li.addClass('anchor-' + anchorType);
            });

        $('#ui-primitives ul').append(li);
    }

    // Primitives should be draggable and droppable onto
    // #ui-new-panel or any other primitive's particular anchor
    $('#ui-primitives li').draggable({
        helper: 'clone',
        opacity: 0.9,
        zIndex: 1000,
        cursor: 'imgs/closedhand.cur',
        start: function(event, ui) {
            ui.helper
                .css('backgroundColor', '#ddd')
                .css('borderColor', '#ddd')
                .css('cursor', 'url(imgs/closedhand.cur), default');

            if($(this).hasClass('anchor-edge'))
                $('#ui-design .anchor-edge').show();
            if($(this).hasClass('anchor-vertex'))
                $('#ui-design .anchor-vertex').show();
        },
        stop: function(event, ui) {
            $('#ui-design .anchor-edge').hide();
            $('#ui-design .anchor-vertex').hide();
        }
    });

    $('#ui-new-panel').droppable({
        accept: '.primitive-mark',
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
    $('.primitive-mark').droppable({
        accept: '.data-col',
        activeClass: 'ui-valid-target',
        hoverClass: 'ui-valid-target-hover',
        drop: function(event, ui) {
            var primitiveId = $(this).attr('id').replace('primitive_', '');
            var primitive = jQuery.extend(true, {}, primitives[primitiveId]);
            var panelId = newPanel();

            setMapping.call(primitive, primitive.defaultDataMapping, ui.helper.text());

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

    // $('#ui-vis svg').hide();
    var stage = $('<div></div>')
        .addClass('vis-stage')
        .attr('id', 'vis-stage_' + panelId)
        // Hacky because DOM Mutation Observers don't seem to track
        // CSS3 resize changes.
        .mousedown(function() { resizing = panelId })
        .mouseup(function() { resizing = undefined })
        .mousemove(function() {
            var panel = panels[panelId];
            for(var primitiveId in panel) {
                var p = panel[primitiveId];
                if(p.hasOwnProperty('width'))
                    p.width = $('#vis-stage_' + panelId).width() - 50;

                if(p.hasOwnProperty('height'))
                    p.height = $('#vis-stage_' + panelId).height() - 50;

                p.visualization();
            }
        });

    $('#ui-vis').append(stage);

    d3.select('#vis-stage_' + panelId)
        .append('svg:svg');

    panels.push({});

    return panelId;
}

function addPrimitive(primitive, panelId) {
    var panel = panels[panelId];
    var primitiveId = primitive.type + '_' + panelId + '_' + Object.keys(panel).length;
    primitive.id = primitiveId;
    primitive.panelId = panelId;
    panels[panelId][primitiveId] = primitive;

    var delegate = getDelegate.call(primitive);

    var delegateNode = $('<div></div>')
        .addClass('delegate')
        .addClass('delegate-preview')
        .attr('id', primitiveId)
        .css('top', delegate.y + 'px')
        .css('left', delegate.x + 'px')
        .css('width', delegate.width   + 'px')
        .css('height', delegate.height + 'px')
        .html(delegate.html);

    if(delegate.hasOwnProperty('dropzone')) {
        var fieldset = buildPropEditor(panelId, primitiveId);
        delegateNode.append(fieldset)
            .css('cursor', 'pointer')
            .click(function() { showPropEditor(panelId, primitiveId); })
            .droppable({
                accept: '.data-col',
                activeClass: 'ui-valid-target',
                hoverClass: 'ui-valid-target-hover',
                tolerance: 'touch',
                drop: function(event, ui) {
                    var p = panels[panelId][primitiveId];
                    setMapping.call(p, '', ui.helper.text());
                    p.visualization();
                }
            });        
    } else {
        for(var dzId in primitive.dropzones) {
            var dzNode   = buildDropZone(panelId, primitiveId, dzId);
            var fieldset = buildPropEditor(panelId, primitiveId, dzId);

            dzNode.append(fieldset);
            delegateNode.append(dzNode);        
        }        
    }

    for(var anchorId in primitive.anchors) {
        var anchorNode = buildAnchor(panelId, primitiveId, anchorId);
        delegateNode.append(anchorNode);
    }

    $('#vis-panel_' + panelId).append(delegateNode);
    if(delegate.hasOwnProperty('script'))
        delegate.script.call(primitive);

    // When a primitive is added, show all of its dropzones 
    // initially and then fade out to cue user.
    window.setTimeout(function() {
        delegateNode.children('.dropzone').fadeOut(500, function() {
            delegateNode.removeClass('delegate-preview');
        }); 
        delegateNode.animate({ borderColor: 'transparent'}, 500);
    }, 1500);
    

    primitive.visualization();
}

function buildDropZone(panelId, primitiveId, dzId) {
    var primitive = panels[panelId][primitiveId];
    var dz = primitive.dropzones[dzId];

    var dzNode = $('<div></div>')
        .addClass('dropzone')
        .css('left',   dz.x + 'px')
        .css('top',    dz.y + 'px')
        .css('width',  dz.width + 'px')
        .css('height', dz.height + 'px')
        .css('z-index', primitive.hasOwnProperty('anchoredTo') ? 1 : 10);

    var dzLbl = $('<h3></h3>')
        .text(dz.label.text)
        .css('marginLeft', dz.label.x + 'px')
        .css('marginTop',  dz.label.y + 'px')
        .css('-webkit-transform', 'rotateZ(' + dz.label.rotate + 'deg)')
        .css('textAlign', 'center');

    dzNode.append(dzLbl);
    dzNode.droppable({
        accept: '.data-col',
        activeClass: 'ui-valid-target',
        hoverClass: 'ui-valid-target-hover',
        tolerance: 'touch',
        over: function(event, ui) {
            var p = jQuery.extend(true, {}, panels[panelId][primitiveId]);
            setMapping.call(p, dzId, ui.helper.text());
            p.visualization(1);
        },
        out: function(event, ui) {
            var p = panels[panelId][primitiveId];
            p.visualization();
        },
        drop: function(event, ui) {
            var p = panels[panelId][primitiveId];
            setMapping.call(p, dzId, ui.helper.text());
            p.visualization();
        }
    });

    dzNode.click(function() { showPropEditor(panelId, primitiveId, dzId); });

    return dzNode;
}

function buildPropEditor(panelId, primitiveId, dzId) {
    var primitive  = panels[panelId][primitiveId];

    var fieldset = $('<fieldset></fieldset>')
        .attr('id', 'fieldset_' + primitiveId + '_' + dzId);

    // fieldset.append($('<legend></legend>').text(dz.label.text));
    var properties = getProperties.call(primitive, dzId);

    $.each(properties, function(i, propId)  {
        var prop = primitive.properties[propId];
        var fNode = $('<div></div>')
            .attr('id', 'field_' + primitiveId + '_' + propId);

        fNode.append(
            $('<label></label>')
                .text(prop.label)
                .attr('for', 'field_' + propId)
        );

        if(prop.type == 'menu') {
            var sel = $('<select></select>')
                .attr('name', 'field_' + propId)
                .change(function() {
                    updateFieldVal(panelId, primitiveId, propId, $(this).val());
                });

            for(var j in prop.options)
                sel.append($('<option></option>').text(prop.options[j]));

            fNode.append(sel);
        } else if((prop.type == 'range') || (prop.type == 'number')) {
            var range = prop.range;
            if(typeof range == 'function')
                range = range.call(primitive);

            fNode.append(
                $('<input>')
                    .attr('type', prop.type)
                    .attr('min', range[0])
                    .attr('max', range[1])
                    .attr('step', prop.step)
                    .attr('value', prop.value)
                    .change(function() {
                        updateFieldVal(panelId, primitiveId, propId, $(this).val());
                    })
            );
        } else if(prop.type == 'text') {
            fNode.append(
                $('<input>')
                    .attr('type', 'text')
                    .attr('value', prop.value)
                    .change(function() {
                        updateFieldVal(panelId, primitiveId, propId, $(this).val());
                    })
            );            
        } else if(prop.type == 'colorpicker') {
            fNode.append(
                $('<input>')
                    .attr('type', 'color')
                    .change(function() {
                        updateFieldVal(panelId, primitiveId, propId, $(this).val());
                    })
            );
        }

        fieldset.append(fNode);
    });

    fieldset.append(
        $('<button></button>')
            .text('Close')
            .click(function(evt) {
                evt.stopPropagation();
                evt.preventDefault();
                $('fieldset').hide();
                $('.delegate-preview').removeClass('delegate-preview');
            })
    );

    return fieldset;
}

function showPropEditor(panelId, primitiveId, dzId) {
    var primitive  = panels[panelId][primitiveId];
    var properties = getProperties.call(primitive, dzId);

    $('#fieldset_' + primitiveId + '_' + dzId).show();
    $('#' + primitiveId).addClass('delegate-preview');

    $.each(properties, function(i, propId) {
        var field = $('#field_' + primitiveId + '_' + propId);
        var prop  = primitive.properties[propId];
        var showField = false;

        if(prop.hasOwnProperty('if_mapped') == false) {
            showField = true;
        } else if(typeof prop.if_mapped == 'boolean') {
            if(prop.hasOwnProperty('mapped') == prop.if_mapped)
                showField = true;
        } else if(typeof prop.if_mapped == 'string') {
            var mappedProp = primitive.properties[prop.if_mapped];
            if(mappedProp.hasOwnProperty('mapped'))
                showField = true;
        }

        if(showField)
            field.show();
        else
            field.hide();
    });
}

function updateFieldVal(panelId, primitiveId, propId, val) {
    var p = panels[panelId][primitiveId];
    p.properties[propId].value = val;
    p.visualization();
}

function buildAnchor(panelId, primitiveId, anchorId) {
    var p = panels[panelId][primitiveId];
    var a = p.anchors[anchorId];
    var left = 0, top = 0, width = 0, height = 0;

    if(a.type == 'edge') {
        left   = a.delegate[0][0];
        top    = a.delegate[0][1];
        width  = a.delegate[1][0] - left;
        height = a.delegate[1][1] - top;
    } else {
        left   = a.delegate[0];
        top    = a.delegate[1];
    }

    if(width == 0)
        width = 5;
    if(height == 0)
        height = 5;

    var anchorNode = $('<div></div>')
        .attr('id', 'anchor_' + primitiveId + '_' + anchorId)
        .addClass('anchor')
        .addClass('anchor-' + a.type)
        .addClass('anchor-' + anchorId)
        .css('left', left + 'px')
        .css('top',  top + 'px')
        .css('width',  width + 'px')
        .css('height', height + 'px');

    anchorNode.droppable({
        accept: '.anchor-' + a.type,
        activeClass: 'ui-valid-target',
        hoverClass: 'ui-valid-target-hover',
        tolerance: 'touch',
        over: function(event, ui) {
            // var p = jQuery.extend(true, {}, panels[panelId][primitiveId]);
            // setMapping.call(p, dzId, ui.helper.text());
            // p.visualization(1);
        },
        out: function(event, ui) {
            // var p = panels[panelId][primitiveId];
            // p.visualization();
        },
        drop: function(event, ui) {
            var clientId  = ui.draggable.attr('id').replace('primitive_', '');
            var client    = jQuery.extend(true, {}, primitives[clientId]);
            client.hostId = p.id;
            client.anchoredTo = anchorId;

            addPrimitive(client, panelId);
        }
    });

    return anchorNode;
}