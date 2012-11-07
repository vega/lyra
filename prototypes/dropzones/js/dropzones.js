var svgm;
// stores all active intermediate objects
var marks=[];
// intermediate link between the data, d3, and its dropzones
var markcount=0;
var dataset = [ 5, 10, 15, 20, 25 ];
var zonewidth=50;
var n;
var data=[];
var propsTimer;
function Mark()
{
	this.markId = 0;
	this.oldData = [];
	this.orientation = 'height';
}
function dataObjectsToColumn(objectarray,colname)
{
	var column=[];
	for(var i in objectarray)
	{
		column.push(objectarray[i][colname]);
	}
	return column;
}

function markHeight(marknum, datacolumn, hover, log) {
	console.log(arguments);

	var vis	= $('#vis');
	var delegate = $("#delegate" + marknum);
	var x = delegate.offset().left - vis.offset().left;
	var y = delegate.offset().top - vis.offset().top;

	extents = d3.extent(datacolumn);

	var yscale;

	if(log == "1") {
		console.log('log scale');

		yscale = d3.scale.log()
			.range([0, 100]);
	} else {
		console.log('linear scale');

		yscale = d3.scale.linear()
			.domain(extents)
			.range([0, 100])
	}

	var xscale = d3.scale.linear()
		.domain([0, datacolumn.length])
		.range([x+75, 600])

	var marks = d3.select("svg#vis").selectAll(".mark"+marknum)
		.data(datacolumn)

	marks.enter()
		.append('rect')
		.attr("class", "mark"+marknum)

	marks.transition().duration(500)
		.attr('height', 0)
		.attr("width", 20)
		// .attr("x", function(d,i){ return xscale(i); })
		.attr("y", y+100)
		.attr("fill", "steelblue")
		.attr("x", function(d,i){ return xscale(i); })
		.attr('y', function(d, i) { return y+100-yscale(d)})
		.attr("height",function(d,i){return yscale(d);})
		.attr('opacity', function(d, i) { return hover ? 0.6 : 1 })
}

function markWidth(marknum, datacolumn, hover) {
	var vis	= $('#vis');
	var delegate = $("#delegate" + marknum);
	var x = delegate.offset().left - vis.offset().left;
	var y = delegate.offset().top - vis.offset().top;

	extents = d3.extent(datacolumn);
	
	var yscale = d3.scale.linear()
		.domain([0, datacolumn.length])
		.range([y-125, y+225]);

	var xscale = d3.scale.linear()
		.domain(extents)
		.range([x+75, 100])

	var marks = d3.select("svg#vis").selectAll(".mark"+marknum)
		.data(datacolumn)

	marks.enter()
		.append('rect')
		.attr("class", "mark"+marknum)

	marks.transition().duration(500)
		.attr('height', 15)
		.attr("width", 0)
		.attr("x", x+100)
		.attr("y", function(d, i) { return yscale(i)})
		.attr("fill", "steelblue")
		.attr('height', 15)
		// .attr("x", function(d,i){ return xscale(d); })
		.attr('y', function(d, i) { return yscale(i)})
		.attr("width",function(d,i){return x+100-xscale(d);})
		.attr('opacity', function(d, i) { return hover ? 0.6 : 1 })	
}


$(document).ready(function(){
		
	$.getJSON("./olympics.json",function(response){
		// use d3 loader instead?
		for (var attr in response) {
			data[attr] = response[attr];
		}
		n=data.length;
		
		// populate list of columns
		for( var label in data[0]) {
			var newelement=$("<li class=\"column\"></li>");
			newelement.text(label);
			newelement.appendTo($("#data ul"));
		}
		$(".column").draggable({
			start: function(event,ui){
				$(".zone").fadeIn(250);
			},
			stop: function(event,ui){
				// $(".zone").fadeOut(250); // necessary or drop won't register
			}
		})
		.draggable("option","helper","clone");
	});
		
    $(".mark").draggable()
	.draggable("option","revert","invalid")
	.draggable("option","helper","clone");

     $( "#design" ).droppable({
		accept: ".mark",
        drop: function( event, ui ) {
        	if(!ui.draggable.hasClass('mark'))
        		return;

        	var mark = new Mark();
        	mark.markId = markcount;

        	var vis = $('#vis');

        	var delegate = $('<div class="delegate zone" id="delegate' + markcount + '"></div>')
        		.css('height', '100px')
        		.css('width', '50px')
        		.css('left', event.pageX + 'px')
        		.css('top', event.pageY + 'px')

        	var heightZone = $('<div class="property zone" id="heightZone' + markcount + '"><div class="rotate">height</div></div>')
        		.css('height', '100px')
        		.css('width', '15px')
        		.css('left', (event.pageX - 20) + 'px')
        		.css('top', event.pageY + 'px')

        	var heightOptions = $('<div class="properties" id="properties' + markcount + '" style="display: none;">' +
        		'<p>Scale: <select id="scale' + markcount + '" onchange="console.log(this.value); markHeight(' + markcount + ', marks[' + markcount + '].oldData, 1, this.value);"><option value="0">Linear</option><option value="1">Logarithmic</option></select></p>' +
        		'<p><button onclick="$(\'.zone\').hide(); $(\'#properties' + markcount + '\').hide()">Save</button></p>' +
        		'</div>')
        		.css('left', (event.pageX - 20) + 'px')
        		.css('top', event.pageY + 'px')


        	var widthZone = $('<div class="property zone" id="widthZone' + markcount + '">width</div>')
        		.css('height', '15px')
        		.css('width', '50px')
        		.css('left', event.pageX + 'px')
        		.css('top', (event.pageY - 20) + 'px')

        	$('body').append(delegate);
        	$('body').append(heightZone);
        	$('body').append(heightOptions);
        	$('body').append(widthZone);

        	heightZone.droppable({
        		accept: '.column',

        		over: function(e, ui) {
        			var marknum = $(this).attr('id').replace('heightZone', '');
        			markHeight(marknum, dataObjectsToColumn(data, ui.draggable.text()), 1);

        			propsTimer = window.setTimeout(function() {
        				$('#properties' + marknum).fadeIn(250);
        			}, 500);
        		},

        		out: function(e, ui) {
        			var marknum = $(this).attr('id').replace('heightZone', '');
        			var o = marks[marknum].orientation;
        			var oldData = marks[marknum].oldData;

        			(o == 'height') ? markHeight(marknum, oldData, 0) : markWidth(marknum, oldData, 0);

        			window.clearTimeout(propsTimer);
        			$('#properties' + marknum).fadeOut(250);
        		},

        		drop: function(e, ui) {
        			var marknum = $(this).attr('id').replace('heightZone', '');
					markHeight(marknum, dataObjectsToColumn(data,ui.draggable.text()), 0);

					marks[marknum].oldData = d3.select('#vis').selectAll('rect').data();
					marks[marknum].orientation = 'height';
					// $('#properties' + marknum).fadeOut(250);
        		}
        	});	

        	widthZone.droppable({
        		accept: '.column',

        		over: function(e, ui) {
        			var marknum = $(this).attr('id').replace('widthZone', '');
        			markWidth(marknum, dataObjectsToColumn(data, ui.draggable.text()), 1);
        		},

        		out: function(e, ui) {
        			var marknum = $(this).attr('id').replace('widthZone', '');
        			var o = marks[marknum].orientation;
        			var oldData = marks[marknum].oldData;

        			(o == 'height') ? markHeight(marknum, oldData, 0) : markWidth(marknum, oldData, 0);
        		},

        		drop: function(e, ui) {
        			var marknum = $(this).attr('id').replace('widthZone', '');
					markWidth(marknum, dataObjectsToColumn(data,ui.draggable.text()), 0);

					marks[marknum].oldData = d3.select('#vis').selectAll('rect').data();
					marks[marknum].orientation = 'width';
        		}
        	});	

        	marks.push(mark);

			markcount++;					

		}
	});

		






});

		

