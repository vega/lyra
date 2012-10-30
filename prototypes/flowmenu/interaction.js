var svgm;
// stores all active intermediate objects
var marks=[];
// intermediate link between the data, d3, and its dropzones
var markcount=0;
var dataset = [ 5, 10, 15, 20, 25 ];
var zonewidth=50;
var n;
var data=[];

function dataObjectsToColumn(objectarray,colname)
{
	var column=[];
	for(var i in objectarray)
	{
		column.push(objectarray[i][colname]);
	}
	return column;
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
			start:function(event,ui){
				$(".zone").show();
			},
			stop:function(event,ui){
				$(".zone").hide(500); // necessary or drop won't register
			}
		})
		.draggable("option","helper","clone");
	});
		
    $(".mark").draggable()
	.draggable("option","revert","invalid")
	.draggable("option","helper","clone");

     $( "#region" ).droppable({
		accept: ".mark",
        drop: function( event, ui ) {
			var x,y;
			var dragged=ui.draggable;
			var visarea = $("#vis");
			x=event.pageX - visarea.offset().left;
			y=event.pageY - visarea.offset().top;
			xmlns = "http://www.w3.org/2000/svg";
			if(dragged.hasClass("mark")) {


				svgm = d3.select("svg#vis");
				svgm.selectAll(".mark"+markcount)
					.data(dataset)
					.enter()
					.append("rect")
					.attr("height",100)
					.attr("width",50)
					.attr("x",x)
					.attr("y",y)
					.attr("fill","steelblue")
					.attr("stroke","#ccc")
					.attr("stroke-width","2")
					.attr("class","mark"+markcount);
					
				var heightzone=$("<div class=\"zone\" id=\"heightzone"+markcount+"\" style=\"width:50px;height:100px;position:absolute;\"></div>");
				var colorzone=$("<div class=\"zone\" id=\"color"+markcount+"\" style=\"width:100px;height:50px;position:absolute;\"></div>");
					
				heightzone.appendTo($("body"));
				heightzone.hide();
				heightzone.droppable({
				
					accept: ".column",
					drop: function(event,ui){
						var marknum=+(($(this).attr("id")).substr(10));
						var colname=ui.draggable.text();
						var datacolumn=[],
						extents=[];
						datacolumn=dataObjectsToColumn(data,colname);
						extents = d3.extent(datacolumn);
						console.log(extents);
						var yscale = d3.scale.linear()
						.domain(extents)
						.range([0, 100]);
						console.log("dropped "+ colname + " on mark"+marknum);		
						svgm = d3.select("svg#vis");
						svgm.selectAll(".mark"+marknum).remove();
						svgm.selectAll(".mark"+marknum)
							.data(datacolumn)
							.enter()
							.append("rect")
							.attr("height",function(d,i){return yscale(d);})
							.attr("width",20)
							.attr("x",function(d,i){return i*20+x;})
							.attr("y",function(d,i){return y+100-yscale(d);})
							.attr("fill","steelblue")
							.attr("stroke","#ccc")
							.attr("stroke-width","2")
							.attr("class","mark"+marknum);
						
					},
					activate:function(event,ui){
						//move to rect
						var marknum=+(($(this).attr("id")).substr(10));
						var myzoned=d3.select("#heightzone"+marknum);
						var myzone=$("#heightzone"+marknum);
						var attachedmarks = d3.selectAll(".mark"+marknum);
					
						var minx = +d3.min(attachedmarks, function(d,i){return this.attr("x")});
						var maxy = +d3.max(attachedmarks, function(d,i){return this.attr("y")});
						var visarea = $("#vis");
						 
										
						console.log(minx + " " + maxy);
		//				myzoned.attr("left",minx-10+"px");
		//				myzoned.attr("top",maxy+"py");
						myzone.css("left",(minx+visarea.offset().left-zonewidth-10)+"px");
						myzone.css("top",maxy+visarea.offset().top+"px");
					}
				});
				
				markcount++;					

			}

		}
	});

		






});

		

