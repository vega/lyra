var svgm;
// stores all active intermediate objects
var marks=[];
// intermediate link between the data, d3, and its dropzones
var markcount=0;
var dataset = [ 5, 10, 15, 20, 25 ];
var zonewidth=50;
var n;
var data=[];
function IMMark(dropzones, d3objclass, columnname)
{
	this.dropzones = dropzones;
	this.d3objclass = d3objclass;
	this.columnname=columnname;
}
$(document).ready(function(){
		
	$.getJSON("./olympics.json",function(response){
		// use d3 loader instead?
		for (var attr in response) {
			data[attr] = response[attr];
		}
		console.log(data);
		n=data.length;
		// populate list of columns
		for( var label in data[0]) {
			console.log(label);
			var newelement=$("<li class=\"column\"></li>");
			newelement.text(label);
			newelement.appendTo($("#data ul"));
		}
		$(".column").draggable({
			start:function(event,ui){
				$(".vertzone").show();
			},
			stop:function(event,ui){
				$(".vertzone").hide(500);
			}
		})
		.draggable("option","helper","clone");
		console.log("stuff")
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
				var newmark = new IMMark();
				marks.push(newmark);
				svgm = d3.select("svg#vis");
				svgm.selectAll("mark"+markcount)
					.data(dataset)
					.enter()
					.append("rect")
					.attr("height",String)
					.attr("width",50)
					.attr("x",x)
					.attr("y",y)
					.attr("fill","steelblue")
					.attr("stroke","#ccc")
					.attr("stroke-width","2")
					
				newmark.d3objclass="mark"+markcount;
				newmark.x = event.pageX;
				newmark.y = event.pageY;
				var heightzone=$("<div class=\"vertzone\" id=\"heightzone"+markcount+"\" style=\"width:50px;height:100px;\"></div>");
					
				heightzone.appendTo($("body"));
				heightzone.hide();
				heightzone.droppable({
					accept: ".column",
					drop: function(event,ui){
						console.log("dropped "+ui.draggable.text());					
					},
					activate:function(event,ui){
						//move to rect
						var marknum=+(($(this).attr("id")).substr(10));
						var myzone=$("#heightzone"+marknum);
						myzone.css("left",(marks[marknum].x-zonewidth-10)+"px");
						myzone.css("top",marks[marknum].y+"px");
					}
				});
				markcount++;					

			}
			else if(dragged.hasClass("column"))
			{
				console.log("text");
			}

		}
	});

		






});

		

