var data;

$(document).ready(function(){
        
    $.getJSON("./data/olympics.json", function(response) {
        data = response;
        // assuming first row is column names
        for(var label in data[0])
            $("#ui-data ul").append('<li class="column">' + label + '</li>');

    });

    for(var id in primitives)
        $('#ui-primitives ul').append('<li><img src="imgs/' + id + '.png" /></li>');

});