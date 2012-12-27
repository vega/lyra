var fullData;
var panels = [];

$(document).ready(function(){
        
    $.getJSON("./data/olympics.json", function(response) {
        fullData = response;
        // assuming first row is column names
        for(var label in fullData[0])
            $("#ui-data ul").append('<li class="data-col">' + label + '</li>');

    });

    for(var id in primitives)
        $('#ui-primitives ul').append('<li class="primitive"><img src="imgs/' + id + '.png" /></li>');

});

function newPanel() {
    var panel = $('<div></div>')
        .addClass('vis-panel')
        .attr('id', 'vis-panel_' + panels.length);

    $('#ui-new-panel').before(panel);

    $('#ui-vis svg').hide();
    var stage = d3.select('#ui-vis')
        .append('svg:svg')
            .attr('class', 'vis-stage')
            .attr('id', 'vis-stage_' + panels.length);

    panels.push([]);
}

function addPrimitive(primitive, panelId) {
    var panel = panels[panelId];
    var primitiveId = primitive.type + '_' + panelId + '_' + panel.length;

    var delegate = $('<div></div>')
        .addClass('delegate')
        .attr('id', primitiveId)
        .css('top', '15px')
        .css('left', '75px')
        .css('width', primitive.delegate.width   + 'px')
        .css('height', primitive.delegate.height + 'px')
        .html(primitive.delegate.html);

    for(var dzId in primitive.dropzones) {
        var dz = primitive.dropzones[dzId];

        var dzNode = $('<div></div>')
            .addClass('dropzone')
            .css('left',   dz.x + 'px')
            .css('top',    dz.y + 'px')
            .css('width',  dz.width + 'px')
            .css('height', dz.height + 'px');

        var dzLbl = $('<h3></h3>')
            .text(dz.label.text)
            .css('marginLeft', dz.label.x + 'px')
            .css('marginTop',  dz.label.y + 'px');

        dzNode.append(dzLbl);
        delegate.append(dzNode);
    }

    $('#vis-panel_' + panelId).append(delegate);

    primitive.id = primitiveId;
    panels[panelId].push(primitive);
}